# راهنمای جامع دیتابیس Clubinex (نسخه جدید)

این سیستم شامل جداول پیشرفته برای مدیریت باشگاه مشتریان، محصولات، تیکتینگ و لاگ‌های سیستمی است.

## لیست جداول و مدل‌ها

### هسته اصلی و کاربران
1.  **Users (`users`)**: جدول اصلی کاربران.
2.  **UserStatus (`user_statuses`)**: وضعیت‌های کاربر (فعال، مسدود).
3.  **Roles & Permissions**: جداول مربوط به پکیج Spatie (roles, permissions, model_has_roles, ...).

### باشگاه مشتریان و امتیازات
4.  **Clubs (`clubs`)**: سطوح باشگاه (برنزی، طلایی و...).
5.  **ClubRegistrations (`club_registrations`)**: درخواست‌های ارتقای سطح.
6.  **PointRules (`point_rules`)**: قوانین کسب امتیاز (موتور پاداش‌دهی داینامیک).
7.  **PointTransactions (`point_transactions`)**: ریزتراکنش‌های امتیازی (کسب، خرج، انقضا).
8.  **Rewards (`rewards`)**: جوایز قابل خرید.
9.  **RewardRedemptions (`reward_redemptions`)**: درخواست‌های دریافت جایزه.

### محصولات و گیمیفیکیشن
10. **Categories (`categories`)**: دسته‌بندی محصولات.
11. **Products (`products`)**: محصولات دارای امتیاز.
12. **ProductSerials (`product_serials`)**: سریال‌های یکتا برای ثبت محصول توسط کاربر.
13. **LuckyWheels (`lucky_wheels`)**: تنظیمات گردونه شانس.
14. **LuckyWheelPrizes (`lucky_wheel_prizes`)**: آیتم‌های گردونه.
15. **LuckyWheelSpins (`lucky_wheel_spins`)**: تاریخچه چرخش‌ها.
16. **Surveys (`surveys`)**, **SurveyQuestions**, **SurveyAnswers**: سیستم نظرسنجی و مسابقه.

### ارتباطات و پشتیبانی
17. **Tickets (`tickets`)**: تیکت‌های پشتیبانی.
18. **TicketMessages (`ticket_messages`)**: پیام‌های رد و بدل شده در تیکت.
19. **Notifications (`notifications`)**: جدول استاندارد لاراول برای اعلان‌های داخلی.
20. **SmsLogs (`sms_logs`)**: آرشیو پیامک‌ها.
21. **EmailLogs (`email_logs`)**: آرشیو ایمیل‌ها.

### سیستمی
22. **SystemSettings (`system_settings`)**: تنظیمات داینامیک کل سیستم (Key-Value).
23. **ActivityLogs (`activity_logs`)**: لاگ دقیق فعالیت‌های سیستم و کاربر.
24. **UserSessions (`user_sessions`)**: تاریخچه نشست‌ها.

## نکات مهم

*   **مدل ProductSerial:** این جدول برای جلوگیری از ثبت تکراری محصول استفاده می‌شود. فیلد `is_used` و `used_by` وضعیت استفاده را مشخص می‌کنند.
*   **نوتیفیکیشن:** از سیستم Notification خود لاراول (`php artisan make:notification`) استفاده می‌شود که قابلیت ارسال به Database, Mail, SMS Channel را دارد.
*   **RBAC:** برای چک کردن دسترسی در کنترلرها از `$this->authorize()` یا میدل‌ور `role:admin` استفاده کنید.
