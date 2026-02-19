<?php

namespace App\Models;

use App\Models\User;
use Morilog\Jalali\Jalalian;
use App\Models\SystemSetting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class PointTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'point_rule_id',
        'reference_type',
        'reference_id',
        'description',
        'balance_after',
        'expires_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_after' => 'integer',
        'expires_at' => 'datetime',
    ];

    // --- Relationships ---

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pointRule()
    {
        return $this->belongsTo(PointRule::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }

    // --- Scopes (Restored) ---

    public function scopeEarned($query)
    {
        return $query->where('type', 'earn');
    }

    public function scopeSpent($query)
    {
        return $query->where('type', 'spend');
    }

    public function scopeExpired($query)
    {
        return $query->where('type', 'expire');
    }

    public function scopeAdjustment($query)
    {
        return $query->where('type', 'adjust');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // --- Helpers ---

    public function isEarned() { return $this->type === 'earn'; }
    public function isSpent() { return $this->type === 'spend'; }
    public function isAdjustment() { return $this->type === 'adjust'; }

    public function getAmountWithSignAttribute()
    {
        return $this->isEarned() || ($this->isAdjustment() && $this->amount > 0)
            ? "+{$this->amount}"
            : "-" . abs($this->amount);
    }

    public function getCreatedAtJalaliAttribute()
    {
        return Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }

    public function getTypeFarsi()
    {
        $types = [
            'earn' => 'کسب امتیاز',
            'spend' => 'خرج امتیاز',
            'expire' => 'انقضای امتیاز',
            'adjust' => 'تعدیل دستی',
        ];
        return $types[$this->type] ?? $this->type;
    }

    /**
     * ایجاد تراکنش جدید و به‌روزرسانی مانده حساب کاربر به صورت اتمی
     * (با استفاده از قفل رکورد برای جلوگیری از Race Condition)
     */
    public static function createTransaction($data)
    {
        return DB::transaction(function () use ($data) {
            // Lock the user row to prevent race conditions during balance update
            $user = User::where('id', $data['user_id'])->lockForUpdate()->first();

            if (!$user) return null;

            // محاسبه مانده جدید
            $currentBalance = $user->current_points;
            $amount = (int) $data['amount'];
            
            // جلوگیری از منفی شدن موجودی (برای خرج کردن و کسر)
            if ($amount < 0 && ($currentBalance + $amount < 0)) {
                // اگر تایپ "adjust" باشد و ادمین بخواهد کسر کند، شاید اجازه دهیم منفی شود؟
                // فعلا طبق منطق معمول، موجودی منفی مجاز نیست مگر اینکه سیاست سیستم تغییر کند.
                throw new \Exception('موجودی امتیاز کاربر کافی نیست.');
            }

            $newBalance = $currentBalance + $amount;

            // ایجاد رکورد تراکنش
            $transaction = self::create(array_merge($data, [
                'balance_after' => $newBalance,
            ]));

            // آپدیت مستقیم کاربر
            $user->current_points = $newBalance;
            $user->save();

            // ثبت لاگ فعالیت
            try {
                $action = $transaction->isEarned() ? 'earn' : ($transaction->isSpent() ? 'spend' : 'adjust');
                ActivityLog::log(
                    "point.{$action}",
                    "تراکنش امتیاز: {$transaction->description} ({$transaction->getAmountWithSignAttribute()})",
                    [
                        'user_id' => $transaction->user_id,
                        'model_type' => self::class,
                        'model_id' => $transaction->id,
                        'new_values' => ['balance' => $newBalance],
                        'action_group' => 'point'
                    ]
                );
            } catch (\Exception $e) {
                // خطای لاگ نباید مانع تراکنش اصلی شود
            }

            return $transaction;
        });
    }

    /**
     * اعطای امتیاز به کاربر
     * (شامل منطق سقف امتیاز روزانه)
     */
    public static function awardPoints($userId, $points, $ruleId = null, $description = '', $reference = null)
    {
        if ($points <= 0) {
            return null;
        }

        // بررسی سقف امتیاز روزانه (Restored Logic)
        $dailyLimit = (int) SystemSetting::getValue('club', 'daily_point_limit', 0);

        // اگر مرجع تراکنش "سریال محصول" یا "ثبت محصول" باشد، سقف روزانه را نادیده بگیر
        $isProductRegistration = $reference && (
            $reference instanceof \App\Models\ProductSerial ||
            $reference instanceof \App\Models\ProductRegistration
        );

        if ($dailyLimit > 0 && !$isProductRegistration) {
            $todayEarned = self::where('user_id', $userId)
                ->where('type', 'earn')
                ->whereDate('created_at', today())
                ->sum('amount');

            if (($todayEarned + $points) > $dailyLimit) {
                ActivityLog::log(
                    'point.limit_reached',
                    "سقف امتیاز روزانه کاربر پر شده است. امتیاز درخواستی: {$points}، کسب شده امروز: {$todayEarned}، سقف: {$dailyLimit}",
                    ['user_id' => $userId, 'severity' => 'warning']
                );
                return null; // عدم اعطای امتیاز
            }
        }

        $data = [
            'user_id' => $userId,
            'type' => 'earn',
            'amount' => $points,
            'point_rule_id' => $ruleId,
            'description' => $description,
        ];

        if ($reference) {
            $data['reference_type'] = get_class($reference);
            $data['reference_id'] = $reference->id;
        }

        return self::createTransaction($data);
    }

    /**
     * کسر امتیاز از کاربر
     */
    public static function deductPoints($userId, $points, $ruleId = null, $description = '', $reference = null)
    {
        if ($points <= 0) {
            return null;
        }

        // نکته: بررسی موجودی در داخل createTransaction (داخل بلوک lockForUpdate) انجام می‌شود
        // تا از Race Condition جلوگیری شود.

        $data = [
            'user_id' => $userId,
            'type' => 'spend',
            'amount' => -$points, // مقدار منفی برای کسر
            'point_rule_id' => $ruleId,
            'description' => $description,
        ];

        if ($reference) {
            $data['reference_type'] = get_class($reference);
            $data['reference_id'] = $reference->id;
        }

        return self::createTransaction($data);
    }
}