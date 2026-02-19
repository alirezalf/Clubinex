<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use App\Models\EmailTheme;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        // دریافت تم‌ها
        $defaultTheme = EmailTheme::where('name', 'like', '%رسمی%')->first();
        $birthdayTheme = EmailTheme::where('name', 'like', '%تولد%')->first();

        $templates = [
            [
                'event_name' => 'otp_login',
                'title_fa' => 'کد ورود (OTP)',
                'variables' => '{code}',
                'sms_active' => true,
                'sms_pattern' => 'کد ورود شما به کلابینکس: {code}',
                'email_active' => false,
                'database_active' => false,
                'email_theme_id' => $defaultTheme?->id,
            ],
            [
                'event_name' => 'welcome_user',
                'title_fa' => 'خوش‌آمدگویی ثبت‌نام',
                'variables' => '{name}, {mobile}',
                'sms_active' => true,
                'sms_pattern' => '{name} عزیز، به باشگاه مشتریان خوش آمدید.',
                'email_active' => true,
                'email_subject' => 'خوش آمدید!',
                'email_body' => '<p>سلام <strong>{name}</strong> عزیز،</p><p>حساب کاربری شما با موفقیت ایجاد شد. از اینکه به جمع ما پیوستید بسیار خوشحالیم.</p>',
                'database_active' => true,
                'database_message' => 'به خانواده بزرگ ما خوش آمدید.',
                'email_theme_id' => $defaultTheme?->id,
            ],
            [
                'event_name' => 'reward_redemption',
                'title_fa' => 'ثبت درخواست جایزه',
                'variables' => '{name}, {reward_title}, {points}',
                'sms_active' => true,
                'sms_pattern' => 'درخواست دریافت {reward_title} ثبت شد.',
                'email_active' => true,
                'email_subject' => 'ثبت درخواست جایزه',
                'email_body' => '<p>کاربر گرامی، درخواست شما برای دریافت <strong>{reward_title}</strong> با موفقیت ثبت شد.</p><p>مبلغ {points} امتیاز از حساب شما کسر گردید.</p>',
                'database_active' => true,
                'database_message' => 'درخواست شما برای {reward_title} با کسر {points} امتیاز ثبت شد.',
                'email_theme_id' => $defaultTheme?->id,
            ],
            [
                'event_name' => 'product_registered',
                'title_fa' => 'ثبت محصول موفق',
                'variables' => '{name}, {product_name}, {points}',
                'sms_active' => false,
                'email_active' => true,
                'email_subject' => 'ثبت محصول موفق',
                'email_body' => '<p>تبریک! محصول <strong>{product_name}</strong> با موفقیت در حساب شما ثبت شد و {points} امتیاز دریافت کردید.</p>',
                'database_active' => true,
                'database_message' => 'محصول {product_name} با موفقیت ثبت شد و {points} امتیاز دریافت کردید.',
                'email_theme_id' => $defaultTheme?->id,
            ],
            [
                'event_name' => 'ticket_reply',
                'title_fa' => 'پاسخ به تیکت',
                'variables' => '{name}, {ticket_id}',
                'sms_active' => true,
                'sms_pattern' => 'پاسخ جدیدی برای تیکت #{ticket_id} ثبت شد.',
                'email_active' => true,
                'email_subject' => 'پاسخ به تیکت پشتیبانی',
                'email_body' => '<p>کاربر گرامی، پاسخی برای تیکت شماره <strong>#{ticket_id}</strong> ارسال شده است. لطفا جهت مشاهده به پنل کاربری مراجعه کنید.</p>',
                'database_active' => true,
                'database_message' => 'تیکت #{ticket_id} بروزرسانی شد.',
                'email_theme_id' => $defaultTheme?->id,
            ],
            [
                'event_name' => 'birthday_congratulation',
                'title_fa' => 'تبریک تولد',
                'variables' => '{name}, {age}',
                'sms_active' => true,
                'sms_pattern' => '{name} عزیز، تولدتان مبارک! هدیه ناقابلی در حساب کاربری شما شارژ شد.',
                'email_active' => true,
                'email_subject' => 'تولدت مبارک! 🎂',
                'email_body' => '<p><strong>{name}</strong> عزیز،</p><p>زادروزت مبارک! امیدواریم سالی سرشار از موفقیت و شادی داشته باشید.</p><p>به همین مناسبت هدیه‌ای در حساب کاربری شما قرار دادیم.</p>',
                'database_active' => true,
                'database_message' => 'تولدتان مبارک! امتیاز هدیه برای شما واریز شد.',
                'email_theme_id' => $birthdayTheme?->id, // استفاده از تم تولد
            ],
        ];

        foreach ($templates as $tmpl) {
            NotificationTemplate::updateOrCreate(
                ['event_name' => $tmpl['event_name']],
                $tmpl
            );
        }
    }
}