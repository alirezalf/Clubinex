<?php

  namespace App\Services;

  use App\Models\LuckyWheel;
  use App\Models\LuckyWheelPrize;
  use App\Models\LuckyWheelSpin;
  use App\Models\PointTransaction;
  use App\Models\RewardRedemption;
  use App\Models\User;
  use Illuminate\Support\Facades\DB;
  use Exception;

  class LuckyWheelService
  {
      /**
      * اجرای عملیات چرخش گردونه برای کاربر
      *
      * @param User $user کاربر جاری
      * @return array نتیجه چرخش شامل جایزه و پیام
      * @throws Exception در صورت بروز خطا یا عدم احراز شرایط
      */
      public function spin(User $user): array
      {
          return DB::transaction(function () use ($user) {
              // 1. قفل کردن رکورد کاربر برای جلوگیری از درخواست همزمان
              $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();

              // 2. اعتبارسنجی گردونه
              $wheel = $this->getActiveWheel();

              if (!$wheel) {
                  throw new Exception('در حال حاضر هیچ گردونه‌ای فعال نیست.');
              }
              
              if ($wheel->required_club_id && $lockedUser->club_id < $wheel->required_club_id) {
                  throw new Exception('سطح کاربری شما برای استفاده از این گردونه کافی نیست.');
              }

              // 3. بررسی موجودی امتیاز
              if ($lockedUser->current_points < $wheel->cost_per_spin) {
                  throw new Exception('موجودی امتیاز شما کافی نیست.');
              }

              // 4. کسر هزینه چرخش (تراکنش منفی)
              if ($wheel->cost_per_spin > 0) {
                  PointTransaction::createTransaction([
                      'user_id' => $user->id,
                      'amount' => -$wheel->cost_per_spin,
                      'type' => 'spend',
                      'description' => "هزینه چرخش گردونه: {$wheel->title}",
                      'reference_type' => LuckyWheel::class,
                      'reference_id' => $wheel->id
                  ]);
              }

              // 5. انتخاب جایزه (لاجیک احتمالاتی)
              $prizes = $wheel->prizes;
              if ($prizes->isEmpty()) {
                  throw new Exception('خطا در پیکربندی گردونه (بدون آیتم).');
              }

              // انتخاب اولیه بر اساس وزن
              $selectedPrize = $this->selectPrizeWithProbability($prizes);

              // 6. مدیریت موجودی کالا (Stock Management) با Race Condition Handling
              if ($selectedPrize->stock !== null) {
                  // قفل کردن سطر جایزه برای اطمینان از موجودی
                  $lockedPrize = LuckyWheelPrize::where('id', $selectedPrize->id)->lockForUpdate()->first();

                  if ($lockedPrize->stock > 0) {
                      $lockedPrize->decrement('stock');
                  } else {
                      // اگر موجودی تمام شده بود، جایزه پوچ یا شانس مجدد را جایگزین کن
                      $fallbackPrize = $prizes->whereIn('type', ['empty', 'retry'])->first();
                      
                      if (!$fallbackPrize) {
                          throw new Exception('موجودی این جایزه به پایان رسید و جایگزینی یافت نشد.');
                      }
                      $selectedPrize = $fallbackPrize;
                  }
              }

              // 7. ثبت نتیجه چرخش
              $isWin = !in_array($selectedPrize->type, ['empty', 'retry']);
              
              $spin = LuckyWheelSpin::create([
                  'user_id' => $user->id,
                  'lucky_wheel_id' => $wheel->id,
                  'prize_id' => $selectedPrize->id,
                  'cost_paid' => $wheel->cost_per_spin,
                  'is_win' => $isWin
              ]);

              // 8. پردازش جایزه و تولید خروجی
              return $this->processPrize($user, $selectedPrize, $spin);
          });
      }

      /**
      * دریافت گردونه فعال فعلی
      */
      private function getActiveWheel()
      {
          return LuckyWheel::where('is_active', true)
              ->where(function($q) {
                  $q->whereNull('start_at')->orWhere('start_at', '<=', now());
              })
              ->where(function($q) {
                  $q->whereNull('end_at')->orWhere('end_at', '>=', now());
              })
              ->with(['prizes' => function($q) {
                  $q->where('is_active', true);
              }])
              ->first();
      }

      /**
      * انتخاب جایزه بر اساس الگوریتم وزن‌دار
      */
      private function selectPrizeWithProbability($prizes)
      {
          // فیلتر کردن جوایزی که موجودی ندارند (یک لایه محافظتی اولیه)
          $availablePrizes = $prizes->filter(function($p) {
              return is_null($p->stock) || $p->stock > 0;
          });
          
          // اگر همه جوایز اصلی تمام شده بودند، فقط پوچ/Retry را برگردان
          if ($availablePrizes->isEmpty()) {
              return $prizes->whereIn('type', ['empty', 'retry'])->first() ?? $prizes->first();
          }

          $totalWeight = $availablePrizes->sum('probability');
          
          if ($totalWeight <= 0) return $availablePrizes->first();

          $random = rand(1, $totalWeight);
          $currentWeight = 0;

          foreach ($availablePrizes as $prize) {
              $currentWeight += $prize->probability;
              if ($random <= $currentWeight) {
                  return $prize;
              }
          }

          return $availablePrizes->last();
      }

      /**
      * پردازش نهایی جایزه (اعطای امتیاز یا ثبت درخواست) و ساخت پیام
      */
      private function processPrize(User $user, $prize, $spin)
      {
          $message = '';
          $messageType = 'info';

          if ($prize->type === 'points') {
              if ($prize->value > 0) {
                  PointTransaction::awardPoints(
                      $user->id,
                      $prize->value,
                      null,
                      "برنده شدن در گردونه: {$prize->title}",
                      $spin
                  );
                  $message = "تبریک! {$prize->value} امتیاز برنده شدید.";
                  $messageType = 'success';
              }
          } elseif ($prize->type === 'item') {
              // ثبت درخواست جایزه فیزیکی
              RewardRedemption::create([
                  'user_id' => $user->id,
                  'reward_id' => null, 
                  'lucky_wheel_spin_id' => $spin->id,
                  'points_spent' => 0,
                  'status' => 'pending',
                  'admin_note' => "برنده شده در گردونه شانس: {$prize->title}"
              ]);
              $message = "تبریک! شما برنده \"{$prize->title}\" شدید. همکاران ما جهت هماهنگی ارسال با شما تماس می‌گیرند.";
              $messageType = 'success';
          } elseif ($prize->type === 'retry') {
              $message = "شانس مجدد! دوباره امتحان کنید.";
          } else {
              $message = "متاسفانه پوچ شد! دوباره تلاش کنید.";
              $messageType = 'warning';
          }

          return [
              'success' => true,
              'prize_id' => $prize->id,
              'prize_title' => $prize->title,
              'prize_type' => $prize->type,
              'message' => $message,
              'message_type' => $messageType,
              'new_points' => $user->fresh()->current_points
          ];
      }
  }