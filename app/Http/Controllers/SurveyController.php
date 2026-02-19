<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\SurveyAnswer;
use App\Models\PointTransaction;
use App\Models\PointRule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Morilog\Jalali\Jalalian;

class SurveyController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $surveys = Survey::active()
            ->where(function($q) use ($user) {
                $q->whereNull('required_club_id')
                  ->orWhere('required_club_id', '<=', $user->club_id);
            })
            ->latest()
            ->get()
            ->map(function ($survey) use ($user) {
                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'slug' => $survey->slug,
                    'description' => $survey->description,
                    'type' => $survey->type,
                    'questions_count' => $survey->questions()->count(),
                    'total_points' => $survey->questions()->sum('points'),
                    'is_participated' => $survey->getUserAttemptCount($user->id) > 0,
                    'is_available' => $survey->isAvailable(), 
                    'status_text' => $this->getSurveyStatusText($survey), 
                    'starts_at_jalali' => $survey->starts_at_jalali,
                    'ends_at_jalali' => $survey->ends_at_jalali,
                ];
            });

        // دریافت تاریخچه آزمون‌های شرکت شده کاربر
        $history = SurveyAnswer::with('survey')
            ->where('user_id', $user->id)
            ->latest('submitted_at')
            ->get()
            ->groupBy('survey_id') 
            ->map(function ($answers) {
                $firstAns = $answers->first();
                $survey = $firstAns->survey;
                
                $score = $answers->sum('score');
                $maxScore = $survey ? $survey->questions()->sum('points') : 0;
                $percentage = $maxScore > 0 ? round(($score / $maxScore) * 100) : 0;

                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'type' => $survey->type === 'quiz' ? 'مسابقه' : 'نظرسنجی',
                    'submitted_at' => Jalalian::fromDateTime($firstAns->submitted_at)->format('Y/m/d H:i'),
                    'score' => $score,
                    'max_score' => $maxScore,
                    'percentage' => $percentage,
                    'is_quiz' => $survey->type === 'quiz'
                ];
            })
            ->values();
            
        return Inertia::render('Surveys/Index', [
            'surveys' => $surveys,
            'history' => $history
        ]);
    }

    private function getSurveyStatusText($survey)
    {
        if (!$survey->is_active) return 'غیرفعال';
        
        $now = now();
        if ($survey->starts_at && $survey->starts_at > $now) {
            return 'شروع نشده';
        }
        if ($survey->ends_at && $survey->ends_at < $now) {
            return 'به پایان رسیده';
        }
        return 'در حال برگزاری';
    }
    
    public function show(Survey $survey)
    {
        $user = auth()->user();

        if (!$survey->isAvailable()) {
            return redirect()->route('surveys.index')->with('error', 'مهلت شرکت در این مسابقه تمام شده یا هنوز شروع نشده است.');
        }

        $attemptCount = $survey->getUserAttemptCount($user->id);
        if ($attemptCount >= $survey->max_attempts) {
             return redirect()->route('surveys.index')->with('message', 'شما قبلاً در این آزمون شرکت کرده‌اید.');
        }

        if ($survey->required_club_id && $user->club_id < $survey->required_club_id) {
             return redirect()->route('surveys.index')->with('error', 'سطح کاربری شما برای این آزمون کافی نیست.');
        }

        $survey->load(['questions' => function($q) {
            $q->orderBy('order');
        }]);
        
        $survey->total_points = $survey->questions->sum('points');

        return Inertia::render('Surveys/Show', [
            'survey' => $survey
        ]);
    }

    public function submit(Request $request, Survey $survey)
    {
        if (!$survey->isAvailable()) {
            return redirect()->route('surveys.index')->with('error', 'زمان شرکت در این مسابقه به پایان رسیده است.');
        }

        $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:survey_questions,id',
            'answers.*.value' => 'required',
        ]);

        $user = auth()->user();
        
        if ($survey->getUserAttemptCount($user->id) >= $survey->max_attempts) {
            return back()->with('error', 'شما قبلاً در این آزمون شرکت کرده‌اید.');
        }

        try {
            DB::beginTransaction();

            $totalScore = 0;
            $maxScore = 0;
            $correctCount = 0;
            $earnedPoints = 0;

            foreach ($request->answers as $ans) {
                $question = $survey->questions->find($ans['question_id']);
                
                $answerData = [
                    'user_id' => $user->id,
                    'survey_id' => $survey->id,
                    'survey_question_id' => $question->id,
                    'answer' => is_array($ans['value']) ? $ans['value'] : (
                        $question->isMultipleChoice() 
                            ? ['selected_option' => (int)$ans['value']] 
                            : ['text' => $ans['value']]
                    ),
                ];

                $submittedAnswer = SurveyAnswer::submitAnswer($answerData);
                
                if ($survey->isQuiz()) {
                    $totalScore += $submittedAnswer->score;
                    $maxScore += $question->points;
                    if ($submittedAnswer->isCorrect()) {
                        $correctCount++;
                    }
                }
            }

            if ($survey->isQuiz() && $maxScore > 0) {
                $percentage = ($totalScore / $maxScore) * 100;
                
                $earnedPoints = $totalScore;

                if ($earnedPoints > 0) {
                    PointTransaction::awardPoints(
                        $user->id,
                        $earnedPoints,
                        null,
                        "امتیاز مسابقه {$survey->title} (نمره: " . round($percentage) . "%)",
                        $survey
                    );
                }
            } else {
                $pointRule = PointRule::where('action_code', 'poll_participation')->first();
                $earnedPoints = $pointRule ? $pointRule->points : 10;
                
                PointTransaction::awardPoints(
                    $user->id,
                    $earnedPoints,
                    $pointRule?->id,
                    "شرکت در نظرسنجی: {$survey->title}",
                    $survey
                );
            }

            DB::commit();

            return Inertia::render('Surveys/Result', [
                'survey' => [
                    'title' => $survey->title,
                    'type' => $survey->type === 'quiz' ? 'مسابقه' : 'نظرسنجی',
                ],
                'result' => [
                    'score' => $totalScore,
                    'max_score' => $maxScore,
                    'correct_count' => $correctCount,
                    'total_questions' => count($request->answers),
                    'earned_points' => $earnedPoints,
                    'percentage' => $maxScore > 0 ? round(($totalScore / $maxScore) * 100) : 0
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در ثبت پاسخ‌ها: ' . $e->getMessage());
        }
    }
}