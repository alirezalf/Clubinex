<?php

namespace App\Models;

use App\Models\PointRule;
use Illuminate\Support\Str;
use Morilog\Jalali\Jalalian;
use App\Models\PointTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SurveyAnswer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'user_id',              // کاربر پاسخ‌دهنده
        'survey_id',            // نظرسنجی مربوطه
        'survey_question_id',   // سوال پاسخ داده شده
        'answer',               // پاسخ کاربر (ذخیره به صورت JSON)
        'score',                // نمره کسب شده (برای مسابقه)
        'is_correct',           // صحیح/غلط بودن (برای مسابقه)
        'ip_address',           // آی‌پی کاربر در زمان پاسخ
        'submitted_at',         // زمان ثبت پاسخ
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'answer' => 'array',        // تبدیل JSON به آرایه
        'score' => 'integer',       // تبدیل به عدد صحیح
        'is_correct' => 'boolean',  // تبدیل به بولین
        'submitted_at' => 'datetime', // تبدیل به تاریخ
    ];

    // ==================== روابط ====================

    /**
     * رابطه چند به یک با کاربر
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * رابطه چند به یک با نظرسنجی
     */
    public function survey()
    {
        return $this->belongsTo(Survey::class);
    }

    /**
     * رابطه چند به یک با سوال
     */
    public function question()
    {
        return $this->belongsTo(SurveyQuestion::class, 'survey_question_id');
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای پاسخ‌های صحیح
     */
    public function scopeCorrect($query)
    {
        return $query->where('is_correct', true);
    }

    /**
     * اسکوپ برای پاسخ‌های غلط
     */
    public function scopeIncorrect($query)
    {
        return $query->where('is_correct', false);
    }

    /**
     * اسکوپ برای پاسخ‌های اخیر
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('submitted_at', 'desc');
    }

    /**
     * اسکوپ برای پاسخ‌های کاربر خاص
     * @param int $userId شناسه کاربر
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * اسکوپ برای پاسخ‌های نظرسنجی خاص
     * @param int $surveyId شناسه نظرسنجی
     */
    public function scopeBySurvey($query, $surveyId)
    {
        return $query->where('survey_id', $surveyId);
    }

    /**
     * اسکوپ برای پاسخ‌های سوال خاص
     * @param int $questionId شناسه سوال
     */
    public function scopeByQuestion($query, $questionId)
    {
        return $query->where('survey_question_id', $questionId);
    }

    /**
     * اسکوپ برای پاسخ‌های با نمره بالا
     * @param int $minScore حداقل نمره
     */
    public function scopeHighScore($query, $minScore = 80)
    {
        return $query->where('score', '>=', $minScore);
    }

    // ==================== توابع کمکی ====================

    /**
     * دریافت متن پاسخ (برای نمایش)
     * @return string متن پاسخ
     */
    public function getAnswerTextAttribute()
    {
        if ($this->question->isMultipleChoice()) {
            $options = $this->question->getOptionsListAttribute();
            $answerIndex = $this->answer['selected_option'] ?? null;
            return $options[$answerIndex] ?? 'نامشخص';
        }

        return $this->answer['text'] ?? $this->answer['value'] ?? 'پاسخ داده نشده';
    }

    /**
     * دریافت مقدار پاسخ (برای پردازش)
     * @return mixed مقدار پاسخ
     */
    public function getAnswerValueAttribute()
    {
        if ($this->question->isMultipleChoice()) {
            return $this->answer['selected_option'] ?? null;
        } elseif ($this->question->isNumber()) {
            return $this->answer['value'] ?? null;
        } else {
            return $this->answer['text'] ?? null;
        }
    }

    /**
     * بررسی آیا پاسخ صحیح است
     * @return bool
     */
    public function isCorrect()
    {
        return $this->is_correct === true;
    }

    /**
     * بررسی آیا پاسخ غلط است
     * @return bool
     */
    public function isIncorrect()
    {
        return $this->is_correct === false;
    }

    /**
     * بررسی آیا نمره دارد (برای مسابقات)
     * @return bool
     */
    public function hasScore()
    {
        return !is_null($this->score);
    }

    /**
     * دریافت زمان ثبت پاسخ به شمسی
     * @return string تاریخ شمسی
     */
    public function getSubmittedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->submitted_at)->format('Y/m/d H:i');
    }

    /**
     * محاسبه درصد صحیح بودن پاسخ
     * @return float|null درصد یا null
     */
    public function getCorrectPercentageAttribute()
    {
        if ($this->survey->isQuiz()) {
            $totalQuestions = $this->survey->questions()->count();
            $correctAnswers = $this->survey->answers()
                ->where('user_id', $this->user_id)
                ->where('is_correct', true)
                ->count();

            if ($totalQuestions > 0) {
                return round(($correctAnswers / $totalQuestions) * 100, 2);
            }
        }
        return null;
    }

    /**
     * دریافت بازخورد پاسخ (برای مسابقات)
     * @return string بازخورد
     */
    public function getFeedbackAttribute()
    {
        if (!$this->survey->isQuiz()) {
            return 'با تشکر از مشارکت شما';
        }

        if ($this->isCorrect()) {
            return 'پاسخ شما صحیح است! 🎉';
        } else {
            $correctAnswer = $this->question->getCorrectAnswerValueAttribute();

            if ($this->question->isMultipleChoice()) {
                $options = $this->question->getOptionsListAttribute();
                $correctOption = $correctAnswer['selected_option'] ?? null;
                return "پاسخ صحیح: " . ($options[$correctOption] ?? 'نامشخص');
            } else {
                return "پاسخ صحیح: " . ($correctAnswer['text'] ?? $correctAnswer['value'] ?? 'نامشخص');
            }
        }
    }

    /**
     * ثبت پاسخ جدید
     * @param array $data اطلاعات پاسخ
     * @return SurveyAnswer|null پاسخ ثبت شده
     */
    public static function submitAnswer($data)
    {
        // بررسی وجود پاسخ قبلی
        $existingAnswer = self::where([
            'user_id' => $data['user_id'],
            'survey_id' => $data['survey_id'],
            'survey_question_id' => $data['survey_question_id'],
        ])->first();

        if ($existingAnswer) {
            // به‌روزرسانی پاسخ موجود
            return $existingAnswer->updateAnswer($data);
        }

        // بررسی صحیح بودن پاسخ (برای مسابقات)
        $question = SurveyQuestion::find($data['survey_question_id']);
        $survey = Survey::find($data['survey_id']);

        // Fix: Extract value properly based on type
        $val = $data['answer']['value'] 
               ?? $data['answer']['text'] 
               ?? $data['answer']['selected_option'] 
               ?? null;

        $checkResult = $question->checkAnswer($val);

        // ایجاد پاسخ جدید
        $answer = self::create(array_merge($data, [
            'score' => $checkResult['score'],
            'is_correct' => $checkResult['is_correct'],
            'submitted_at' => now(),
            'ip_address' => request()->ip(),
        ]));

        if ($answer) {
            // ثبت لاگ فعالیت
            ActivityLog::log(
                'survey.answer_submitted',
                "کاربر {$answer->user->mobile} به سوالی از نظرسنجی {$survey->title} پاسخ داد",
                [
                    'user_id' => $answer->user_id,
                    'model_type' => self::class,
                    'model_id' => $answer->id,
                ]
            );

            // اعطای امتیاز (اگر مسابقه باشد و کاربر تمام سوالات را پاسخ داده باشد)
            if ($survey->isQuiz() && $answer->isCorrect()) {
                $answer->awardPoints();
            }
        }

        return $answer;
    }

    /**
     * به‌روزرسانی پاسخ موجود
     * @param array $data اطلاعات جدید
     * @return $this
     */
    public function updateAnswer($data)
    {
        $oldData = [
            'answer' => $this->answer,
            'score' => $this->score,
            'is_correct' => $this->is_correct,
        ];

        $question = $this->question;
        
        // Fix: Extract value properly
        $val = $data['answer']['value'] 
               ?? $data['answer']['text'] 
               ?? $data['answer']['selected_option'] 
               ?? null;

        $checkResult = $question->checkAnswer($val);

        $this->update(array_merge($data, [
            'score' => $checkResult['score'],
            'is_correct' => $checkResult['is_correct'],
            'submitted_at' => now(),
        ]));

        // ثبت لاگ تغییرات
        ActivityLog::log(
            'survey.answer_updated',
            "پاسخ کاربر {$this->user->mobile} به‌روزرسانی شد",
            [
                'user_id' => $this->user_id,
                'model_type' => self::class,
                'model_id' => $this->id,
                'old_values' => $oldData,
                'new_values' => [
                    'answer' => $this->answer,
                    'score' => $this->score,
                    'is_correct' => $this->is_correct,
                ],
            ]
        );

        return $this;
    }

    /**
     * اعطای امتیاز برای پاسخ صحیح
     */
    private function awardPoints()
    {
        $pointRule = PointRule::where('action_code', 'like', 'quiz_score_%')->first();

        if ($pointRule && $this->score >= ($pointRule->conditions['min_score'] ?? 0)) {
            PointTransaction::create([
                'user_id' => $this->user_id,
                'type' => 'earn',
                'amount' => $pointRule->points,
                'point_rule_id' => $pointRule->id,
                'reference_type' => self::class,
                'reference_id' => $this->id,
                'description' => "امتیاز مسابقه - {$this->survey->title}",
                'balance_after' => $this->user->current_points + $pointRule->points,
            ]);
        }
    }

    /**
     * بررسی آیا این پاسخ آخرین پاسخ کاربر به این نظرسنجی است
     * @return bool
     */
    public function isLastAnswerForSurvey()
    {
        $totalQuestions = $this->survey->questions()->count();
        $answeredQuestions = $this->survey->answers()
            ->where('user_id', $this->user_id)
            ->distinct('survey_question_id')
            ->count('survey_question_id');

        return $answeredQuestions >= $totalQuestions;
    }

    /**
     * دریافت اطلاعات خلاصه پاسخ
     * @return array اطلاعات خلاصه
     */
    public function getSummaryAttribute()
    {
        return [
            'question_text' => Str::limit($this->question->question, 50),
            'answer_text' => $this->answer_text,
            'score' => $this->score,
            'is_correct' => $this->is_correct ? 'صحیح' : 'غلط',
            'submitted_at' => $this->getSubmittedAtJalaliAttribute(),
            'feedback' => $this->feedback,
        ];
    }
}
