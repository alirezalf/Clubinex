<?php

namespace App\Services\AdminReports;

use App\Models\Survey;
use App\Models\SurveyAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Morilog\Jalali\Jalalian;

class SurveyReportService
{
    public function getSurveys(Request $request)
    {
        $query = Survey::withCount(['answers as total_participants_count' => function ($q) {
            $q->select(DB::raw('count(distinct user_id)'));
        }]);

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        $data = $query->latest()->paginate(15)->withQueryString();

        $data->getCollection()->transform(function ($s) {
            $s->starts_at_jalali = $s->starts_at_jalali;
            $s->ends_at_jalali = $s->ends_at_jalali;
            return $s;
        });

        return $data;
    }

    public function getSurveyStats($id)
    {
        $survey = Survey::with(['questions' => function ($q) {
            $q->orderBy('order');
        }])->findOrFail($id);

        $totalParticipants = SurveyAnswer::where('survey_id', $id)
            ->distinct('user_id')
            ->count('user_id');

        $questionsStats = $this->analyzeQuestions($survey, $totalParticipants);
        $demographics = $this->analyzeDemographics($id, $survey);
        $participants = $this->getParticipantsList($id, $survey);
        $duration = $this->calculateDuration($survey);

        return [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'type' => $survey->type === 'quiz' ? 'مسابقه' : 'نظرسنجی',
                'starts_at' => $survey->starts_at_jalali,
                'ends_at' => $survey->ends_at_jalali,
                'duration' => $duration,
                'is_active' => $survey->is_active,
                'total_participants' => $totalParticipants
            ],
            'questions' => $questionsStats,
            'demographics' => $demographics,
            'participants' => $participants
        ];
    }

    public function getUserStats($id)
    {
        $user = User::findOrFail($id);

        $participations = SurveyAnswer::with('survey')
            ->where('user_id', $id)
            ->get()
            ->groupBy('survey_id')
            ->map(function ($answers) {
                $survey = $answers->first()->survey;
                if (!$survey) return null;

                $submittedAt = $answers->first()->submitted_at;
                $totalScore = $answers->sum('score');
                $maxScore = $survey->questions()->sum('points');

                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'type' => $survey->type === 'quiz' ? 'مسابقه' : 'نظرسنجی',
                    'date' => $submittedAt ? Jalalian::fromDateTime($submittedAt)->format('Y/m/d H:i') : '-',
                    'score' => $survey->type === 'quiz' ? "{$totalScore} از {$maxScore}" : '-',
                    'status' => $survey->is_active ? 'فعال' : 'بسته شده'
                ];
            })
            ->filter()
            ->values();

        return [
            'user_name' => $user->full_name,
            'participations' => $participations,
            'total_count' => $participations->count()
        ];
    }

    public function getSurveyParticipantsForExport($surveyId)
    {
        $survey = Survey::findOrFail($surveyId);

        return User::whereHas('surveyAnswers', function ($q) use ($surveyId) {
            $q->where('survey_id', $surveyId);
        })
            ->with(['province', 'city', 'surveyAnswers' => function ($q) use ($surveyId) {
                $q->where('survey_id', $surveyId);
            }])
            ->get()
            ->map(function ($u) use ($survey) {
                return [
                    'id' => $u->id,
                    'full_name' => $u->full_name,
                    'mobile' => $u->mobile,
                    'national_code' => $u->national_code,
                    'province' => $u->province?->name ?? '-',
                    'city' => $u->city?->name ?? '-',
                    'address' => $u->address,
                    'score' => $u->surveyAnswers->sum('score'),
                    'date' => $u->surveyAnswers->first() ? Jalalian::fromDateTime($u->surveyAnswers->first()->created_at)->format('Y/m/d H:i') : '-'
                ];
            });
    }

    private function analyzeQuestions($survey, $totalParticipants)
    {
        return $survey->questions->map(function ($question) use ($totalParticipants) {
            $totalAnswers = $question->answers()->count();

            $stats = [
                'id' => $question->id,
                'text' => $question->question,
                'type' => $question->type,
                'total_answers' => $totalAnswers,
                'no_answer_count' => $totalParticipants - $totalAnswers,
                'options' => [],
                'average' => null,
                'correct_answer_display' => null,
                'correct_count' => 0,
                'correct_percent' => 0,
            ];

            if ($question->correct_answer) {
                if ($question->type === 'text' && isset($question->correct_answer['text'])) {
                    $stats['correct_answer_display'] = $question->correct_answer['text'];
                } elseif ($question->type === 'number') {
                    $min = $question->correct_answer['min'] ?? '-';
                    $max = $question->correct_answer['max'] ?? '-';
                    $stats['correct_answer_display'] = "بین $min تا $max";
                }
            }

            if ($question->type === 'multiple_choice') {
                $optionsData = [];
                $optionCounts = $question->answers()
                    ->selectRaw("JSON_UNQUOTE(JSON_EXTRACT(answer, '$.selected_option')) as opt_index, count(*) as count")
                    ->groupBy('opt_index')
                    ->pluck('count', 'opt_index');

                if ($question->options) {
                    foreach ($question->options as $index => $text) {
                        $count = $optionCounts[$index] ?? 0;
                        $percent = $totalAnswers > 0 ? round(($count / $totalAnswers) * 100, 1) : 0;

                        $isCorrect = false;
                        if (isset($question->correct_answer['selected_option'])) {
                            $isCorrect = (int)$question->correct_answer['selected_option'] === $index;
                            if ($isCorrect) {
                                $stats['correct_answer_display'] = $text;
                            }
                        }

                        $optionsData[] = [
                            'label' => $text,
                            'count' => $count,
                            'percent' => $percent,
                            'is_correct' => $isCorrect
                        ];
                    }
                }
                $stats['options'] = $optionsData;
            } elseif ($question->type === 'number' || $question->type === 'rating') {
                $avg = $question->answers()
                    ->selectRaw("AVG(CAST(JSON_UNQUOTE(JSON_EXTRACT(answer, '$.value')) AS DECIMAL(10,2))) as avg_val")
                    ->value('avg_val');
                $stats['average'] = $avg ? round($avg, 2) : 0;
            }

            if ($question->correct_answer) {
                $correctCount = $question->answers()->where('is_correct', true)->count();
                $stats['correct_count'] = $correctCount;
                $stats['correct_percent'] = $totalAnswers > 0 ? round(($correctCount / $totalAnswers) * 100, 1) : 0;
            }

            return $stats;
        });
    }

    private function analyzeDemographics($id, $survey)
    {
        // Gender
        $genderStats = User::whereHas('surveyAnswers', function ($q) use ($id) {
            $q->where('survey_id', $id);
        })
            ->select('gender', DB::raw('count(*) as count'))
            ->groupBy('gender')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->gender ?? 'unknown' => $item->count];
            })
            ->toArray();

        // Province
        $provinceStats = User::whereHas('surveyAnswers', function ($q) use ($id) {
            $q->where('survey_id', $id);
        })
            ->join('provinces', 'users.province_id', '=', 'provinces.id')
            ->select('provinces.name as province_name', DB::raw('count(*) as count'))
            ->groupBy('provinces.name')
            ->orderByDesc('count')
            ->limit(10)
            ->pluck('count', 'province_name')
            ->toArray();

        // Scores
        $scores = [
            'passed' => 0,
            'failed' => 0,
            'avg_score' => 0
        ];

        if ($survey->type === 'quiz') {
            $totalPoints = $survey->questions->sum('points');
            $passScore = $totalPoints * 0.5;

            $userScores = SurveyAnswer::where('survey_id', $id)
                ->select('user_id', DB::raw('SUM(score) as total_score'))
                ->groupBy('user_id')
                ->get();

            $passed = $userScores->where('total_score', '>=', $passScore)->count();
            $failed = $userScores->count() - $passed;
            $avg = $userScores->avg('total_score');

            $scores = [
                'passed' => $passed,
                'failed' => $failed,
                'avg_score' => round($avg, 1)
            ];
        }

        return [
            'gender' => [
                'male' => $genderStats['male'] ?? 0,
                'female' => $genderStats['female'] ?? 0,
                'other' => $genderStats['other'] ?? 0,
                'unknown' => $genderStats['unknown'] ?? 0,
            ],
            'location' => $provinceStats,
            'scores' => $scores
        ];
    }

    private function getParticipantsList($id, $survey)
    {
        $participants = User::whereHas('surveyAnswers', function ($q) use ($id) {
            $q->where('survey_id', $id);
        })
            ->with(['province', 'city'])
            ->with(['surveyAnswers' => function ($q) use ($id) {
                $q->where('survey_id', $id)
                  ->select('user_id', 'score', 'created_at', 'is_correct')
                  ->latest();
            }])
            ->select('id', 'first_name', 'last_name', 'mobile', 'national_code', 'province_id', 'city_id')
            ->paginate(15);

        $participants->getCollection()->transform(function ($u) {
            $totalScore = $u->surveyAnswers->sum('score');
            $lastAnswer = $u->surveyAnswers->first();
            return [
                'id' => $u->id,
                'full_name' => $u->full_name,
                'mobile' => $u->mobile,
                'national_code' => $u->national_code ?? '-',
                'address_summary' => ($u->province?->name ?? '-') . ' - ' . ($u->city?->name ?? '-'),
                'total_score' => $totalScore,
                'participation_date' => $lastAnswer ? Jalalian::fromDateTime($lastAnswer->created_at)->format('Y/m/d H:i') : '-',
            ];
        });

        return $participants;
    }

    private function calculateDuration($survey)
    {
        if ($survey->starts_at && $survey->ends_at) {
            $diff = $survey->starts_at->diff($survey->ends_at);
            return $diff->days . ' روز';
        }
        return '-';
    }
}
