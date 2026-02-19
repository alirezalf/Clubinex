<?php

namespace Database\Seeders;

use App\Models\Survey;
use App\Models\SurveyQuestion;
use Illuminate\Database\Seeder;

class SurveySeeder extends Seeder
{
    public function run(): void
    {
        // ایجاد یک مسابقه عمومی
        $survey = Survey::create([
            'title' => 'مسابقه اطلاعات عمومی بزرگ',
            'slug' => 'general-knowledge-quiz',
            'description' => 'به ۳۰ سوال اطلاعات عمومی پاسخ دهید و امتیاز بگیرید!',
            'type' => 'quiz',
            'is_active' => true,
            'is_public' => true,
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'max_attempts' => 1,
            'duration_minutes' => 15, // اضافه شده
        ]);

        $questions = [
            ['q' => 'پایتخت ایران کدام شهر است؟', 'opts' => ['اصفهان', 'تهران', 'شیراز', 'مشهد'], 'ans' => 1],
            ['q' => 'بزرگترین اقیانوس جهان کدام است؟', 'opts' => ['اطلس', 'هند', 'آرام', 'منجمد شمالی'], 'ans' => 2],
            ['q' => 'تعداد دندان‌های انسان بالغ چقدر است؟', 'opts' => ['30', '32', '28', '34'], 'ans' => 1],
            ['q' => 'کدام سیاره به سیاره سرخ معروف است؟', 'opts' => ['زمین', 'مریخ', 'مشتری', 'زهره'], 'ans' => 1],
            ['q' => 'شاعر شاهنامه کیست؟', 'opts' => ['حافظ', 'سعدی', 'فردوسی', 'مولوی'], 'ans' => 2],
            ['q' => 'واحد پول ژاپن چیست؟', 'opts' => ['یوان', 'دلار', 'ین', 'روپیه'], 'ans' => 2],
            ['q' => 'سریع‌ترین حیوان خشکی کدام است؟', 'opts' => ['شیر', 'اسب', 'یوزپلنگ', 'غزال'], 'ans' => 2],
            ['q' => 'کدام عنصر شیمیایی با علامت O نشان داده می‌شود؟', 'opts' => ['طلا', 'نقره', 'اکسیژن', 'آهن'], 'ans' => 2],
            ['q' => 'بلندترین قله جهان کدام است؟', 'opts' => ['دماوند', 'کی۲', 'اورست', 'البرز'], 'ans' => 2],
            ['q' => 'تعداد حلقه‌های المپیک چند تاست؟', 'opts' => ['4', '5', '6', '7'], 'ans' => 1],
        ];

        foreach ($questions as $index => $q) {
            SurveyQuestion::create([
                'survey_id' => $survey->id,
                'question' => $q['q'],
                'type' => 'multiple_choice',
                'options' => $q['opts'],
                'correct_answer' => ['selected_option' => $q['ans']], // ایندکس گزینه صحیح
                'points' => 10,
                'is_required' => true,
                'order' => $index + 1,
            ]);
        }
    }
}