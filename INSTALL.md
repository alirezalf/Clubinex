
# راهنمای نصب و راه‌اندازی WebCrafter Pro (Clubinex)

این راهنما برای راه‌اندازی پروژه روی سیستم لوکال (Localhost) تهیه شده است.

## پیش‌نیازها

* PHP 8.2 یا بالاتر
* Composer
* Node.js (نسخه 18 یا بالاتر)
* MySQL

---

## ۱. نصب وابستگی‌ها

ترمینال را در پوشه اصلی پروژه باز کنید و دستورات زیر را اجرا کنید:

### نصب پکیج‌های لاراول (Back-end)

```bash
composer install
```

### نصب پکیج‌های ری‌اکت (Front-end)

```bash
npm install
```

```bash
npm install -D postcss autoprefixer
```

```bash
npm install ziggy-js
```

```bash
npm install recharts
```

```bash
npm install react-multi-date-picker
```


---

## ۲. تنظیمات محیطی (.env)

۱. از فایل `.env.example` یک کپی بگیرید و نام آن را به `.env` تغییر دهید.
۲. فایل `.env` را باز کنید و تنظیمات دیتابیس را وارد کنید:

```env
APP_NAME="Clubinex"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clubinex_db  <-- نام دیتابیس خود را اینجا بنویسید
DB_USERNAME=root         <-- نام کاربری دیتابیس
DB_PASSWORD=             <-- رمز عبور دیتابیس
```

۳. تولید کلید رمزنگاری برنامه:

```bash
php artisan key:generate
```

---

## ۳. دیتابیس و داده‌های اولیه

**نکته مهم:** قبل از اجرا، مطمئن شوید دیتابیس در MySQL ساخته شده باشد.

```bash
# اجرای مایگریشن‌ها و وارد کردن داده‌های اولیه (ادمین، تنظیمات، منوها)
php artisan migrate:fresh --seed
```

این دستور تمام جداول را می‌سازد و یک کاربر ادمین پیش‌فرض ایجاد می‌کند.

---

## ۴. لینک کردن فایل‌ها

برای اینکه تصاویر آپلود شده نمایش داده شوند، باید شورت‌کات Storage ساخته شود:

```bash
php artisan storage:link
```

---

## ۵. اجرای پروژه

برای اجرای کامل، به دو ترمینال نیاز دارید:

**ترمینال اول (اجرای سرور لاراول):**

```bash
php artisan serve
```

**ترمینال دوم (کامپایل استیت‌های فرانت‌اند):**

```bash
npm run dev
```

حالا مرورگر را باز کنید و به آدرس `http://localhost:8000` بروید.

---

## اطلاعات ورود پیش‌فرض

* **موبایل:** `09196600545`
* **رمز عبور:** `admin`
* **پنل مدیریت:** پس از ورود، از منوی کناری به بخش مدیریت دسترسی دارید.

## عیب‌یابی (Troubleshooting)

* **خطای Vite:** اگر استایل‌ها لود نشدند، مطمئن شوید `npm run dev` در حال اجراست.
* **خطای Route not defined:** دستور `php artisan optimize:clear` را بزنید.
* **خطای دیتابیس:** مطمئن شوید سرویس MySQL (مثل XAMPP) روشن است.
