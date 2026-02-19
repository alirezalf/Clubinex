<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductSerial;
use App\Models\ProductRegistration;
use App\Models\PointRule;
use App\Models\PointTransaction;
use App\Models\ActivityLog;
use App\Models\User;
use App\Notifications\SystemNotification;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Exception;

class ProductService
{
    /**
     * بررسی اعتبار سریال محصول
     */
    public function checkSerial(string $serialCode, ?int $userId = null)
    {
        $serial = ProductSerial::where('serial_code', $serialCode)
            ->with('product.category')
            ->first();

        if (!$serial) {
            return [
                'valid' => false,
                'message' => 'این کد سریال در سیستم تعریف نشده است. لطفاً از طریق ثبت کامل (با فاکتور) اقدام کنید.'
            ];
        }

        if ($serial->is_used) {
            if ($userId && $serial->used_by == $userId) {
                return [
                    'valid' => false,
                    'message' => 'شما قبلاً این محصول را ثبت کرده‌اید.'
                ];
            }
            return [
                'valid' => false,
                'message' => 'این کد سریال قبلاً توسط کاربر دیگری ثبت شده است.'
            ];
        }

        return [
            'valid' => true,
            'product' => $serial->product,
            'points' => $this->calculatePoints($serial->product),
            'message' => 'سریال معتبر است.'
        ];
    }

    /**
     * ثبت سریع محصول با استفاده از کد سریال
     */
    public function registerBySerial(User $user, string $serialCode)
    {
        return DB::transaction(function () use ($serialCode, $user) {
            $existingSerial = ProductSerial::where('serial_code', $serialCode)
                ->lockForUpdate()
                ->with('product')
                ->first();

            if (!$existingSerial) {
                throw new Exception('SERIAL_NOT_FOUND');
            }

            if ($existingSerial->is_used) {
                $msg = ($existingSerial->used_by == $user->id)
                    ? 'شما قبلاً این محصول را ثبت کرده‌اید.'
                    : 'این سریال قبلاً توسط کاربر دیگری ثبت شده است.';
                throw new Exception($msg);
            }

            $existingSerial->update([
                'is_used' => true,
                'used_by' => $user->id,
                'used_at' => now(),
            ]);

            $points = $this->calculatePoints($existingSerial->product);

            if ($points > 0) {
                PointTransaction::awardPoints(
                    $user->id,
                    $points,
                    null,
                    "ثبت محصول: {$existingSerial->product->title} (سریال: {$existingSerial->serial_code})",
                    $existingSerial
                );
            }

            ActivityLog::log('product.registered', "کاربر محصول {$existingSerial->product->title} را ثبت کرد", ['user_id' => $user->id]);

            // Notifications
            try {
                NotificationService::send('product_registered', $user, [
                    'product_name' => $existingSerial->product->title,
                    'points' => $points
                ]);
            } catch (Exception $e) {}

            $this->notifyAdmins("ثبت محصول آنی", "کاربر {$user->full_name} محصول {$existingSerial->product->title} را با سریال {$serialCode} ثبت کرد.");

            return [
                'success' => true,
                'points' => $points,
                'product_name' => $existingSerial->product->title
            ];
        });
    }

    /**
     * ایجاد درخواست ثبت محصول (با آپلود عکس و فاکتور)
     */
    public function createRegistrationRequest(User $user, array $data, $imageFile = null, $invoiceFile = null)
    {
        return DB::transaction(function () use ($user, $data, $imageFile, $invoiceFile) {
            $serialCode = $data['tool_serial'] ?? null;

            if (empty($serialCode)) {
                $modelSlug = Str::slug($data['tool_model']);
                $modelPrefix = strtoupper(substr($modelSlug, 0, 6));
                $randomPart = strtoupper(Str::random(8));
                $serialCode = $modelPrefix . '-' . $randomPart;
            }

            $regData = [
                'user_id' => $user->id,
                'product_name' => $data['tool_name'],
                'product_model' => $data['tool_model'],
                'product_brand' => $data['tool_brand_name'] ?? null,
                'serial_code' => $serialCode,
                'category_id' => $data['category_id'],
                'customer_type' => $data['customer_user'],
                'customer_mobile' => $data['customer_mobile_number'] ?? null,
                'seller_type' => $data['seller_user'],
                'seller_mobile' => $data['seller_mobile_number'] ?? null,
                'introducer_type' => $data['introducer_user'],
                'introducer_mobile' => $data['introducer_mobile_number'] ?? null,
                'warranty_status' => $data['guarantee_status'],
                'status' => 'pending',
            ];

            if ($imageFile) {
                $path = $imageFile->store('product_requests', 'public');
                $regData['product_image'] = Storage::url($path);
            }

            if ($invoiceFile) {
                $path = $invoiceFile->store('invoices', 'public');
                $regData['invoice_image'] = Storage::url($path);
            }

            $registration = ProductRegistration::create($regData);

            $this->notifyAdmins("درخواست ثبت محصول", "کاربر {$user->full_name} درخواست ثبت محصول {$regData['product_name']} را ارسال کرد.");

            return $registration;
        });
    }

    /**
     * بروزرسانی درخواست ثبت محصول
     */
    public function updateRegistrationRequest(User $user, int $id, array $data, $imageFile = null, $invoiceFile = null)
    {
        $registration = ProductRegistration::where('user_id', $user->id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $serialCode = $data['tool_serial'] ?? null;
        if (empty($serialCode)) {
            // اگر سریال خالی بود، از سریال قبلی استفاده کن یا اگر قبلی هم اتوماتیک بود نگهش دار
            if ($registration->serial_code && str_starts_with($registration->serial_code, 'PROD-')) {
                $serialCode = $registration->serial_code;
            } else {
                $modelSlug = Str::slug($data['tool_model']);
                $modelPrefix = strtoupper(substr($modelSlug, 0, 6));
                $randomPart = strtoupper(Str::random(8));
                $serialCode = $modelPrefix . '-' . $randomPart;
            }
        }

        $regData = [
            'product_name' => $data['tool_name'],
            'product_model' => $data['tool_model'],
            'product_brand' => $data['tool_brand_name'] ?? null,
            'serial_code' => $serialCode,
            'category_id' => $data['category_id'],
            'customer_type' => $data['customer_user'],
            'customer_mobile' => $data['customer_mobile_number'] ?? null,
            'seller_type' => $data['seller_user'],
            'seller_mobile' => $data['seller_mobile_number'] ?? null,
            'introducer_type' => $data['introducer_user'],
            'introducer_mobile' => $data['introducer_mobile_number'] ?? null,
            'warranty_status' => $data['guarantee_status'],
        ];

        if ($imageFile) {
            $this->deleteFile($registration->product_image);
            $path = $imageFile->store('product_requests', 'public');
            $regData['product_image'] = Storage::url($path);
        }

        if ($invoiceFile) {
            $this->deleteFile($registration->invoice_image);
            $path = $invoiceFile->store('invoices', 'public');
            $regData['invoice_image'] = Storage::url($path);
        }

        $registration->update($regData);
        return $registration;
    }

    /**
     * حذف درخواست ثبت محصول
     */
    public function deleteRegistrationRequest(User $user, int $id)
    {
        $registration = ProductRegistration::where('user_id', $user->id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $this->deleteFile($registration->product_image);
        $this->deleteFile($registration->invoice_image);

        return $registration->delete();
    }

    /**
     * تغییر وضعیت درخواست توسط ادمین (تایید/رد)
     */
    public function processRegistrationStatus(int $id, string $status, ?string $adminNote, int $adminId)
    {
        $registration = ProductRegistration::findOrFail($id);

        if ($registration->status !== 'pending') {
            throw new Exception('این درخواست قبلاً بررسی شده است.');
        }

        return DB::transaction(function () use ($registration, $status, $adminNote, $adminId) {
            $registration->update([
                'status' => $status,
                'admin_note' => $adminNote,
                'admin_id' => $adminId
            ]);

            if ($status === 'approved') {
                $this->approveRegistrationLogic($registration);
            }

            return $registration;
        });
    }

    // --- Private Helpers ---

    private function calculatePoints($product)
    {
        if ($product->points_value > 0) {
            return $product->points_value;
        }
        $defaultRule = PointRule::where('action_code', 'product_registration_default')->first();
        return $defaultRule ? $defaultRule->points : 0;
    }

    private function notifyAdmins($title, $message)
    {
        try {
            $admins = User::role(['super-admin', 'admin'])->get();
            if ($admins->count() > 0) {
                Notification::send($admins, new SystemNotification($title, $message));
            }
        } catch (Exception $e) {}
    }

    private function deleteFile($url)
    {
        if ($url) {
            $path = str_replace('/storage/', 'public/', $url);
            if (Storage::exists($path)) Storage::delete($path);
        }
    }

    private function approveRegistrationLogic(ProductRegistration $reg)
    {
        $points = 50; // Default
        $product = Product::where('title', 'like', $reg->product_name)->first();

        if ($product) {
            $points = $this->calculatePoints($product);
        }

        // 1. اعطای امتیاز به کاربر
        PointTransaction::awardPoints(
            $reg->user_id,
            $points,
            null,
            "تایید ثبت محصول دستی: {$reg->product_name}",
            $reg
        );

        // 2. مدیریت پاداش معرف (اگر معرف دیگری در فرم ذکر شده باشد)
        if ($reg->introducer_type === 'other' && $reg->introducer_mobile) {
            $introducer = User::where('mobile', $reg->introducer_mobile)->first();
            if ($introducer && $introducer->isActive()) {
                $referralRule = PointRule::where('action_code', 'purchase_referral')->active()->first();
                if ($referralRule) {
                    PointTransaction::awardPoints(
                        $introducer->id,
                        $referralRule->points,
                        $referralRule->id,
                        "پاداش معرفی: خرید توسط {$reg->user->full_name} ({$reg->product_name})",
                        $reg
                    );
                }
            }
        }

        // 3. ثبت سریال در سیستم (به عنوان استفاده شده) برای جلوگیری از ثبت مجدد
        if ($product && $reg->serial_code) {
            try {
                ProductSerial::firstOrCreate(
                    ['serial_code' => $reg->serial_code],
                    [
                        'product_id' => $product->id,
                        'is_used' => true,
                        'used_by' => $reg->user_id,
                        'used_at' => now(),
                    ]
                );
            } catch (Exception $e) {
                // خطا نادیده گرفته می‌شود (شاید قبلاً ثبت شده باشد)
            }
        }
        
        // ارسال اعلان به کاربر
        try {
            NotificationService::send('product_registered', $reg->user, [
                'product_name' => $reg->product_name,
                'points' => $points
            ]);
        } catch (Exception $e) {}
    }
}