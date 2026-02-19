<?php

namespace App\Services\Report;

use Illuminate\Support\Facades\Schema;

class FieldService
{
    private array $fieldTranslations = [
        'id' => 'شناسه',
        'created_at' => 'تاریخ ایجاد',
        'updated_at' => 'تاریخ ویرایش',
        'deleted_at' => 'تاریخ حذف',
        'user_id' => 'شناسه کاربر',
        'title' => 'عنوان',
        'name' => 'نام',
        'first_name' => 'نام',
        'last_name' => 'نام خانوادگی',
        'mobile' => 'موبایل',
        'email' => 'ایمیل',
        'description' => 'توضیحات',
        'status' => 'وضعیت',
        'type' => 'نوع',
        'amount' => 'مقدار',
        'current_points' => 'امتیاز فعلی',
        'national_code' => 'کد ملی',
        'club_id' => 'شناسه باشگاه',
        'referral_code' => 'کد معرف',
        'serial_code' => 'کد سریال',
        'points_value' => 'ارزش امتیاز',
        'is_active' => 'فعال',
        'is_used' => 'استفاده شده',
        'points_spent' => 'امتیاز خرج شده',
        'tracking_code' => 'کد رهگیری',
        'subject' => 'موضوع',
        'priority' => 'اولویت',
        'department' => 'دپارتمان',
        'ip_address' => 'آیپی',
        'action' => 'عملیات',
        'model_type' => 'نوع مدل',
        'model_id' => 'شناسه مدل',
        'balance_after' => 'مانده بعد تراکنش',
        'used_by' => 'استفاده کننده',
        'used_at' => 'تاریخ استفاده',
        'customer_type' => 'نوع مشتری',
        'seller_type' => 'نوع فروشنده',
        'warranty_status' => 'وضعیت گارانتی',
        'admin_note' => 'یادداشت مدیر',
        'duration_minutes' => 'مدت زمان (دقیقه)',
        'starts_at' => 'شروع',
        'ends_at' => 'پایان',
        'score' => 'نمره',
        'is_correct' => 'صحیح است؟',
        'submitted_at' => 'تاریخ ثبت',
        'registered_at' => 'تاریخ ثبتنام',
        'expires_at' => 'تاریخ انقضا',
        'completed_at' => 'تاریخ تکمیل',
        'approved_at' => 'تاریخ تایید',
        'rejected_at' => 'تاریخ رد',
        'cancelled_at' => 'تاریخ لغو',
        'quantity' => 'تعداد',
        'price' => 'قیمت',
        'total' => 'مجموع',
        'discount' => 'تخفیف',
        'tax' => 'مالیات',
        'commission' => 'کارمزد',
        'referral_code_used' => 'کد معرف استفاده شده',
        'points_earned' => 'امتیاز کسب شده',
        'points_cost' => 'هزینه امتیاز',
        'payment_method' => 'روش پرداخت',
        'transaction_id' => 'شناسه تراکنش',
        'bank_tracking_code' => 'کد پیگیری بانک',
        'card_number' => 'شماره کارت',
        'sheba_number' => 'شماره شبا',
        'account_number' => 'شماره حساب',
        'bank_name' => 'نام بانک',
    ];

    private array $hiddenFields = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'token',
        'verification_code',
        'reset_token',
        'api_token',
        'oauth_token',
        'oauth_token_secret',
        'refresh_token'
    ];

    public function getFieldsFor(string $table): array
    {
        if (!Schema::hasTable($table)) {
            return [];
        }

        $columns = Schema::getColumnListing($table);
        $fields = [];

        foreach ($columns as $column) {
            if (in_array($column, $this->hiddenFields)) {
                continue;
            }

            $label = $this->fieldTranslations[$column] ?? $this->formatColumnName($column);
            $fields[$column] = $label;
        }

        return $fields;
    }

    private function formatColumnName(string $column): string
    {
        $name = str_replace('_', ' ', $column);
        $name = preg_replace('/([a-z])([A-Z])/', '$1 $2', $name);
        return ucfirst($name);
    }
}
