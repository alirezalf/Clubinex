<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Slider;
use App\Models\Slide;

class SliderSeeder extends Seeder
{
    public function run(): void
    {
        // 1. اسلایدر صفحه اصلی (Hero Slider)
        $homeSlider = Slider::firstOrCreate(
            ['location_key' => 'home_main'],
            [
                'title' => 'اسلایدر اصلی صفحه ورود',
                'height_class' => 'h-[600px]',
                'interval' => 6000,
                'effect' => 'fade',
                'border_radius' => 'rounded-none',
                'slides_per_view' => 1,
                'is_active' => true,
            ]
        );

        // حذف اسلایدهای قبلی برای جلوگیری از تکرار در صورت اجرای مجدد
        Slide::where('slider_id', $homeSlider->id)->delete();

        $homeSlides = [
            [
                'image_path' => 'https://placehold.co/1920x800/1e293b/FFF?text=Welcome+To+Clubinex',
                'title' => 'به باشگاه مشتریان خوش آمدید',
                'description' => 'تجربه‌ای نوین از وفاداری و گیمیفیکیشن. با هر خرید امتیاز بگیرید و برنده شوید.',
                'button_text' => 'شروع کنید',
                'button_link' => '/login',
                'content_position' => 'center-center',
                'text_color' => '#ffffff',
                'bg_text' => 'CLUBINEX',
                'text_size' => 'text-5xl',
                'button_bg_color' => '#3b82f6',
                'anim_speed' => 'normal',
                'order' => 1,
            ],
            [
                'image_path' => 'https://placehold.co/1920x800/4f46e5/FFF?text=Win+Prizes',
                'title' => 'گردونه شانس را بچرخانید!',
                'description' => 'شانس خود را برای برنده شدن جوایز نفیس و امتیازات ویژه امتحان کنید.',
                'button_text' => 'مشاهده جوایز',
                'button_link' => '#features',
                'content_position' => 'center-right',
                'text_color' => '#ffffff',
                'bg_text' => 'LUCKY',
                'button_bg_color' => '#a855f7',
                'order' => 2,
            ],
            [
                'image_path' => 'https://placehold.co/1920x800/059669/FFF?text=Shopping+Rewards',
                'title' => 'خرید کنید، پاداش بگیرید',
                'description' => 'امتیازات خود را در فروشگاه جوایز به کالا و خدمات تبدیل کنید.',
                'button_text' => null,
                'button_link' => null,
                'content_position' => 'center-left',
                'text_color' => '#ffffff',
                'order' => 3,
            ],
        ];

        foreach ($homeSlides as $slideData) {
            Slide::create(array_merge($slideData, ['slider_id' => $homeSlider->id, 'is_active' => true]));
        }

        // 2. اسلایدر بالای داشبورد (Dashboard Banner)
        $dashSlider = Slider::firstOrCreate(
            ['location_key' => 'dashboard_top'],
            [
                'title' => 'بنرهای بالای داشبورد',
                'height_class' => 'h-48',
                'interval' => 8000,
                'border_radius' => 'rounded-2xl',
                'effect' => 'slide',
                'is_active' => true,
            ]
        );

        Slide::where('slider_id', $dashSlider->id)->delete();

        $dashSlides = [
            [
                'image_path' => 'https://placehold.co/1200x400/ea580c/FFF?text=Noruz+Festival',
                'title' => 'جشنواره نوروزی آغاز شد!',
                'description' => 'تا ۵۰٪ تخفیف برای تبدیل امتیاز در ایام نوروز.',
                'button_text' => 'مشاهده جوایز',
                'button_link' => '/rewards',
                'content_position' => 'center-right',
                'text_color' => '#ffffff',
                'bg_text' => 'NORUZ',
                'button_bg_color' => '#ffffff',
                'button_color' => '#ea580c',
                'order' => 1,
            ],
            [
                'image_path' => 'https://placehold.co/1200x400/2563eb/FFF?text=Complete+Profile',
                'title' => 'هنوز پروفایلت رو کامل نکردی؟',
                'description' => 'همین الان اطلاعاتت رو تکمیل کن و ۱۰۰ امتیاز هدیه بگیر.',
                'button_text' => 'تکمیل پروفایل',
                'button_link' => '/profile',
                'content_position' => 'center-center',
                'text_color' => '#ffffff',
                'button_bg_color' => '#1e40af',
                'order' => 2,
            ],
        ];

        foreach ($dashSlides as $slideData) {
            Slide::create(array_merge($slideData, ['slider_id' => $dashSlider->id, 'is_active' => true]));
        }
    }
}