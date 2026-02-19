<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSerial;

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

        foreach ($products as $prodData) {
            $product = Product::firstOrCreate(['title' => $prodData['title']], $prodData);

            // 3. ایجاد سریال‌های نمونه برای هر محصول
            if (ProductSerial::where('product_id', $product->id)->count() == 0) {
                for ($i = 0; $i < 5; $i++) {
                    ProductSerial::create([
                        'product_id' => $product->id,
                        'serial_code' => strtoupper(substr(md5($product->id . time() . $i), 0, 12)),
                        'is_used' => false,
                    ]);
                }
            }
        }
    }
}
