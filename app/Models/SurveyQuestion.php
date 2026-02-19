<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SurveyQuestion extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * فیلدهای قابل پر شدن
     */
    protected $fillable = [
        'survey_id',        // نظرسنجی والد
        'question',         // متن سوال
        'type',             // نوع سوال (چندگزینه‌ای/متنی/عددی/امتیازدهی)
        'options',          // گزینه‌ها (برای چندگزینه‌ای)
        'correct_answer',   // پاسخ صحیح (برای مسابقه)
        'points',           // امتیاز این سوال
        'is_required',      // اجباری بودن پاسخ
        'order',            // ترتیب نمایش
    ];

    /**
     * تبدیل انواع داده‌ها
     */
    protected $casts = [
        'options' => 'array',          // تبدیل JSON به آرایه
        'correct_answer' => 'array',   // تبدیل JSON به آرایه
        'points' => 'integer',         // تبدیل به عدد صحیح
        'is_required' => 'boolean',    // تبدیل به بولین
        'order' => 'integer',          // تبدیل به عدد صحیح
    ];

    // ==================== روابط ====================

    /**
     * رابطه چند به یک با نظرسنجی
     */
    public function survey()
    {
        return $this->belongsTo(Survey::class);
    }

    /**
     * رابطه یک به چند با پاسخ‌ها
     */
    public function answers()
    {
        return $this->hasMany(SurveyAnswer::class, 'survey_question_id');
    }

    // ==================== اسکوپ‌ها ====================

    /**
     * اسکوپ برای سوالات اجباری
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * اسکوپ برای سوالات اختیاری
     */
    public function scopeOptional($query)
    {
        return $query->where('is_required', false);
    }

    /**
     * اسکوپ برای مرتب‌سازی بر اساس ترتیب
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * اسکوپ برای سوالات چندگزینه‌ای
     */
    public function scopeMultipleChoice($query)
    {
        return $query->where('type', 'multiple_choice');
    }

    /**
     * اسکوپ برای سوالات متنی
     */
    public function scopeText($query)
    {
        return $query->where('type', 'text');
    }

    /**
     * اسکوپ برای سوالات عددی
     */
    public function scopeNumber($query)
    {
        return $query->where('type', 'number');
    }

    /**
     * اسکوپ برای سوالات امتیازدهی
     */
    public function scopeRating($query)
    {
        return $query->where('type', 'rating');
    }

    // ==================== توابع کمکی ====================

    /**
     * بررسی آیا سوال چندگزینه‌ای است
     * @return bool
     */
    public function isMultipleChoice()
    {
        return $this->type === 'multiple_choice';
    }

    /**
     * بررسی آیا سوال متنی است
     * @return bool
     */
    public function isText()
    {
        return $this->type === 'text';
    }

    /**
     * بررسی آیا سوال عددی است
     * @return bool
     */
    public function isNumber()
    {
        return $this->type === 'number';
    }

    /**
     * بررسی آیا سوال امتیازدهی است
     * @return bool
     */
    public function isRating()
    {
        return $this->type === 'rating';
    }

    /**
     * دریافت لیست گزینه‌ها (برای سوالات چندگزینه‌ای)
     * @return array لیست گزینه‌ها
     */
    public function getOptionsListAttribute()
    {
        return $this->options ?? [];
    }

    /**
     * دریافت پاسخ صحیح (برای مسابقات)
     * @return array|null پاسخ صحیح یا null
     */
    public function getCorrectAnswerValueAttribute()
    {
        return $this->correct_answer ?? null;
    }

    /**
     * بررسی آیا سوال پاسخ صحیح دارد (برای مسابقات)
     * @return bool
     */
    public function hasCorrectAnswer()
    {
        return !empty($this->correct_answer);
    }

    /**
     * دریافت تعداد پاسخ‌های داده شده به این سوال
     * @return int تعداد پاسخ‌ها
     */
    public function getAnswersCountAttribute()
    {
        return $this->answers()->count();
    }

    /**
     * بررسی صحیح بودن پاسخ کاربر
     * @param mixed $userAnswer پاسخ کاربر
     * @return array [is_correct => bool, score => int, feedback => string]
     */
    public function checkAnswer($userAnswer)
    {
        if (!$this->hasCorrectAnswer()) {
            return [
                'is_correct' => null,
                'score' => $this->points,
                'feedback' => 'این سوال نمره ندارد'
            ];
        }

        $correctAnswer = $this->getCorrectAnswerValueAttribute();
        $isCorrect = false;

        // بررسی بر اساس نوع سوال
        switch ($this->type) {
            case 'multiple_choice':
                $isCorrect = $userAnswer == $correctAnswer['selected_option'] ?? null;
                break;
            
            case 'number':
                $min = $correctAnswer['min'] ?? null;
                $max = $correctAnswer['max'] ?? null;
                $isCorrect = ($min === null || $userAnswer >= $min) && 
                           ($max === null || $userAnswer <= $max);
                break;
            
            case 'text':
                $correctText = strtolower(trim($correctAnswer['text'] ?? ''));
                $userText = strtolower(trim($userAnswer));
                $isCorrect = $correctText === $userText;
                break;
        }

        return [
            'is_correct' => $isCorrect,
            'score' => $isCorrect ? $this->points : 0,
            'feedback' => $isCorrect ? 'پاسخ صحیح است' : 'پاسخ نادرست است'
        ];
    }

    /**
     * دریافت آمار پاسخ‌ها برای سوالات چندگزینه‌ای
     * @return array آمار گزینه‌ها
     */
    public function getOptionsStatisticsAttribute()
    {
        if (!$this->isMultipleChoice()) {
            return [];
        }

        $options = $this->getOptionsListAttribute();
        $statistics = [];

        foreach ($options as $index => $option) {
            $count = $this->answers()
                ->whereRaw("JSON_EXTRACT(answer, '$.selected_option') = ?", [$index])
                ->count();

            $percentage = $this->answers_count > 0 
                ? round(($count / $this->answers_count) * 100, 2)
                : 0;

            $statistics[] = [
                'option' => $option,
                'index' => $index,
                'count' => $count,
                'percentage' => $percentage,
                'is_correct' => $this->getCorrectAnswerValueAttribute()['selected_option'] ?? null == $index,
            ];
        }

        return $statistics;
    }

    /**
     * دریافت میانگین نمره برای این سوال (برای مسابقات)
     * @return float|null میانگین نمره یا null
     */
    public function getAverageScoreAttribute()
    {
        if ($this->survey->isQuiz()) {
            return $this->answers()->avg('score');
        }
        return null;
    }

    /**
     * جابجایی ترتیب سوال
     * @param string $direction جهت ('up' یا 'down')
     * @return bool
     */
    public function move($direction)
    {
        if ($direction === 'up') {
            $previous = $this->survey->questions()
                ->where('order', '<', $this->order)
                ->orderBy('order', 'desc')
                ->first();
            
            if ($previous) {
                $this->order = $previous->order;
                $previous->order = $previous->order + 1;
                $previous->save();
                $this->save();
                return true;
            }
        } elseif ($direction === 'down') {
            $next = $this->survey->questions()
                ->where('order', '>', $this->order)
                ->orderBy('order')
                ->first();
            
            if ($next) {
                $this->order = $next->order;
                $next->order = $next->order - 1;
                $next->save();
                $this->save();
                return true;
            }
        }

        return false;
    }

    /**
     * بررسی آیا سوال قابل حذف است
     * @return bool
     */
    public function isDeletable()
    {
        return $this->answers()->count() === 0;
    }

    /**
     * دریافت نوع سوال به فارسی
     * @return string نوع فارسی
     */
    public function getTypeFarsiAttribute()
    {
        $types = [
            'multiple_choice' => 'چندگزینه‌ای',
            'text' => 'متنی',
            'number' => 'عددی',
            'rating' => 'امتیازدهی',
        ];

        return $types[$this->type] ?? $this->type;
    }
}