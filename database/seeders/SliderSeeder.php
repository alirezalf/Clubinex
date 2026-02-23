<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Slider;
use App\Models\Slide;

class SliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
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

        // 3. اسلایدر صفحه ورود (Login Page)
        $loginSlider = Slider::firstOrCreate(
            ['location_key' => 'login'],
            [
                'title' => 'اسلایدر صفحه ورود',
                'height_class' => 'h-full', // Full height for login page
                'interval' => 5000,
                'effect' => 'fade',
                'border_radius' => 'rounded-none',
                'slides_per_view' => 1,
                'is_active' => true,
            ]
        );

        Slide::where('slider_id', $loginSlider->id)->delete();

        $loginSlides = [
            [
                'image_path' => 'https://placehold.co/1080x1920/1e1e2e/FFF?text=Welcome+Back',
                'title' => 'خوش آمدید',
                'description' => 'به جمع باشگاه مشتریان ما بپیوندید و از خدمات ویژه بهره‌مند شوید.',
                'content_position' => 'bottom-center',
                'text_color' => '#ffffff',
                'order' => 1,
            ],
            [
                'image_path' => null, // Test color slide
                'bg_color' => '#4f46e5',
                'title' => 'طراحی مدرن',
                'description' => 'رابط کاربری زیبا و چشم‌نواز برای راحتی شما.',
                'content_position' => 'center-center',
                'text_color' => '#ffffff',
                'order' => 2,
            ],
        ];

        foreach ($loginSlides as $slideData) {
            Slide::create(array_merge($slideData, ['slider_id' => $loginSlider->id, 'is_active' => true]));
        }

        // 4. اسلایدر فروشگاه (Products Index)
        $productsSlider = Slider::firstOrCreate(
            ['location_key' => 'products_index'],
            [
                'title' => 'اسلایدر فروشگاه',
                'height_class' => 'h-64',
                'interval' => 7000,
                'effect' => 'slide',
                'border_radius' => 'rounded-xl',
                'slides_per_view' => 1,
                'is_active' => true,
            ]
        );

        Slide::where('slider_id', $productsSlider->id)->delete();

        $productsSlides = [
            [
                'image_path' => 'https://placehold.co/1200x400/0891b2/FFF?text=New+Arrivals',
                'title' => 'محصولات جدید رسید',
                'description' => 'جدیدترین محصولات دیجیتال با گارانتی اصلی.',
                'button_text' => 'مشاهده محصولات',
                'button_link' => '/products?sort=newest',
                'content_position' => 'center-left',
                'text_color' => '#ffffff',
                'button_bg_color' => '#155e75',
                'order' => 1,
            ],
            [
                'image_path' => 'https://placehold.co/1200x400/be123c/FFF?text=Special+Offer',
                'title' => 'تخفیف ویژه اعضا',
                'description' => 'تا ۳۰٪ تخفیف برای اعضای سطح طلایی و بالاتر.',
                'button_text' => 'خرید کنید',
                'button_link' => '/products?discount=true',
                'content_position' => 'center-right',
                'text_color' => '#ffffff',
                'button_bg_color' => '#881337',
                'order' => 2,
            ],
        ];

        foreach ($productsSlides as $slideData) {
            Slide::create(array_merge($slideData, ['slider_id' => $productsSlider->id, 'is_active' => true]));
        }

        // 5. اسلایدر جوایز (Rewards Index)
        $rewardsSlider = Slider::firstOrCreate(
            ['location_key' => 'rewards_index'],
            [
                'title' => 'اسلایدر جوایز',
                'height_class' => 'h-64',
                'interval' => 6000,
                'effect' => 'fade',
                'border_radius' => 'rounded-xl',
                'slides_per_view' => 1,
                'is_active' => true,
            ]
        );

        Slide::where('slider_id', $rewardsSlider->id)->delete();

        $rewardsSlides = [
            [
                'image_path' => 'https://placehold.co/1200x400/7c3aed/FFF?text=Redeem+Points',
                'title' => 'امتیازات خود را نقد کنید',
                'description' => 'با امتیازات جمع‌آوری شده، جوایز ارزشمند دریافت کنید.',
                'button_text' => 'مشاهده لیست جوایز',
                'button_link' => '#rewards-list',
                'content_position' => 'center-center',
                'text_color' => '#ffffff',
                'button_bg_color' => '#5b21b6',
                'order' => 1,
            ],
        ];

        foreach ($rewardsSlides as $slideData) {
            Slide::create(array_merge($slideData, ['slider_id' => $rewardsSlider->id, 'is_active' => true]));
        }

        // 6. اسلایدر باشگاه‌ها (Clubs Index)
        $clubsSlider = Slider::firstOrCreate(
            ['location_key' => 'clubs_index'],
            [
                'title' => 'اسلایدر باشگاه‌ها',
                'height_class' => 'h-56',
                'interval' => 8000,
                'effect' => 'slide',
                'border_radius' => 'rounded-xl',
                'slides_per_view' => 1,
                'is_active' => true,
            ]
        );

        Slide::where('slider_id', $clubsSlider->id)->delete();

        $clubsSlides = [
            [
                'image_path' => 'https://placehold.co/1200x400/059669/FFF?text=Level+Up',
                'title' => 'سطح خود را ارتقا دهید',
                'description' => 'با فعالیت بیشتر، به سطوح بالاتر برسید و از مزایای ویژه برخوردار شوید.',
                'content_position' => 'center-left',
                'text_color' => '#ffffff',
                'order' => 1,
            ],
        ];

        foreach ($clubsSlides as $slideData) {
            Slide::create(array_merge($slideData, ['slider_id' => $clubsSlider->id, 'is_active' => true]));
        }

        // 7. اسلایدر وبلاگ/اخبار (Blog Index)
        $blogSlider = Slider::firstOrCreate(
            ['location_key' => 'blog_index'],
            [
                'title' => 'اسلایدر وبلاگ',
                'height_class' => 'h-64',
                'interval' => 5000,
                'effect' => 'fade',
                'border_radius' => 'rounded-xl',
                'slides_per_view' => 1,
                'is_active' => true,
            ]
        );

        Slide::where('slider_id', $blogSlider->id)->delete();

        $blogSlides = [
            [
                'image_path' => 'https://placehold.co/1200x400/475569/FFF?text=Latest+News',
                'title' => 'آخرین اخبار باشگاه',
                'description' => 'از جدیدترین رویدادها و تخفیف‌های باشگاه باخبر شوید.',
                'content_position' => 'bottom-left',
                'text_color' => '#ffffff',
                'order' => 1,
            ],
        ];

        foreach ($blogSlides as $slideData) {
            Slide::create(array_merge($slideData, ['slider_id' => $blogSlider->id, 'is_active' => true]));
        }
    }
}
