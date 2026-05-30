<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| مسیرهای رابط برنامه‌نویسی برای اتصال اپلیکیشن‌ها و سیستم‌های خارجی
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// مسیر نمونه برای وب‌هوک (دریافت اطلاعات از سرویس‌های خارجی)
Route::post('/webhooks/payment', function (Request $request) {
    // اعتبار سنجی توکن وب‌هوک از روی هدر (مرحله 9.3)
    $token = $request->header('X-Webhook-Token');
    if ($token !== env('WEBHOOK_SECRET')) {
        return response()->json(['error' => 'Unauthorized access'], 401);
    }

    $event = $request->input('event');
    $data = $request->input('data');

    // پردازش رویداد
    if ($event === 'payment.successful') {
        // پیاده‌سازی منطق پرداخت موفق
        // \Log::info('Webhook received', $data);
        return response()->json(['message' => 'پرداخت با موفقیت ثبت شد']);
    }

    return response()->json(['message' => 'رویداد نامعتبر است'], 400);
});

// توسعه API داخلی برای استعلام امتیاز کاربر (مرحله 9.1 و 9.2)
Route::prefix('v1')->group(function () {
    /**
     * @api {get} /api/v1/users/:mobile/points درخواست موجودی امتیاز کاربر
     * @apiName GetUserPoints
     * @apiGroup User
     *
     * @apiParam {String} mobile شماره موبایل کاربر
     *
     * @apiSuccess {Number} points امتیاز فعلی کاربر
     * @apiSuccess {String} club نام سطح فعلی باشگاه
     */
    Route::get('/users/{mobile}/points', function (string $mobile) {
        $user = User::where('mobile', $mobile)->with('club')->first();
        
        if (!$user) {
            return response()->json(['error' => 'کاربر یافت نشد'], 404);
        }

        return response()->json([
            'points' => $user->current_points,
            'club' => $user->club ? $user->club->name : 'بدون سطح',
            'mobile' => $user->mobile,
        ]);
    });
});
