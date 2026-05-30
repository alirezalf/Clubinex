<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSerial;
use App\Models\User;
use App\Models\PointTransaction;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ایجاد دسته‌بندی‌ها
        $categories = [
            ['title' => 'کالای دیجیتال', 'slug' => 'digital', 'icon' => 'smartphone'],
            ['title' => 'لوازم خانگی', 'slug' => 'home-appliances', 'icon' => 'home'],
            ['title' => 'ابزار آلات', 'slug' => 'tools', 'icon' => 'tool'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 2. ایجاد محصولات
        $digitalCat = Category::where('slug', 'digital')->first();
        $homeCat = Category::where('slug', 'home-appliances')->first();

        $products = [
            [
                'category_id' => $digitalCat->id,
                'title' => 'گوشی موبایل مدل X14',
                'model_name' => 'SuperPhone X14',
                'description' => 'جدیدترین گوشی هوشمند با دوربین ۱۰۸ مگاپیکسل و پردازنده قدرتمند.',
                'image' => 'https://placehold.co/400x400/0284c7/white?text=Mobile+X14',
                'points_value' => 500,
                'is_active' => true,
            ],
            [
                'category_id' => $digitalCat->id,
                'title' => 'هدفون بی‌سیم Pro',
                'model_name' => 'AudioBuds Pro',
                'description' => 'حذف نویز فعال، عمر باتری ۳۰ ساعت و کیفیت صدای عالی.',
                'image' => 'https://placehold.co/400x400/64748b/white?text=Headphone',
                'points_value' => 150,
                'is_active' => true,
            ],
            [
                'category_id' => $homeCat->id,
                'title' => 'قهوه‌ساز اتوماتیک',
                'model_name' => 'BrewMaster 2000',
                'description' => 'تهیه اسپرسو، کاپوچینو و لته تنها با یک دکمه.',
                'image' => 'https://placehold.co/400x400/d97706/white?text=Coffee+Maker',
                'points_value' => 300,
                'is_active' => true,
            ],
        ];

        $users = User::whereDoesntHave('roles', function($q) {
            $q->where('name', 'super-admin');
        })->get();

        foreach ($products as $prodData) {
            $product = Product::firstOrCreate(['title' => $prodData['title']], $prodData);

            // 3. ایجاد سریال‌های نمونه برای هر محصول و تخصیص به کاربران تنستی
            if (ProductSerial::where('product_id', $product->id)->count() == 0) {
                // ۳۰ سریال برای هر محصول
                for ($i = 0; $i < 30; $i++) {
                    $serial = ProductSerial::create([
                        'product_id' => $product->id,
                        'serial_code' => strtoupper(substr(md5($product->id . time() . 'rnd' . $i), 0, 12)),
                        'is_used' => false,
                    ]);

                    // شبیه‌سازی استفاده توسط کاربران (برای نیمی از سریال‌ها)
                    if ($i < 15 && $users->count() > 0) {
                        $randomUser = $users->random();
                        $serial->update([
                            'is_used' => true,
                            'used_by' => $randomUser->id,
                            'used_at' => now()->subDays(rand(1, 60)),
                        ]);

                        // محاسبه مانده جدید
                        $newBalance = $randomUser->current_points + $product->points_value;

                        // اضافه کردن تراکنش امتیاز برای خریدار محصول
                        PointTransaction::create([
                            'user_id' => $randomUser->id,
                            'amount' => $product->points_value,
                            'type' => 'earn',
                            'description' => "امتیاز ثبت محصول: {$product->title}",
                            'reference_type' => get_class($serial),
                            'reference_id' => $serial->id,
                            'balance_after' => $newBalance,
                            'created_at' => $serial->used_at,
                            'updated_at' => $serial->used_at,
                        ]);

                        // آپدیت موجودی کاربر
                        $randomUser->update(['current_points' => $newBalance]);
                    }
                }
            }
        }
    }
}
