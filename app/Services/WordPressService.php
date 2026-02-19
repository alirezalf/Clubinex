<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class WordPressService
{
    protected $url;
    protected $key;
    protected $secret;

    public function __construct()
    {
        $this->url = SystemSetting::getValue('wordpress', 'wp_url');
        $this->key = SystemSetting::getValue('wordpress', 'wp_consumer_key');
        $this->secret = SystemSetting::getValue('wordpress', 'wp_consumer_secret');
    }

    public function isConfigured()
    {
        return !empty($this->url) && !empty($this->key) && !empty($this->secret);
    }

    /**
     * دریافت یک نمونه آیتم برای استخراج فیلدها
     */
    public function getSampleItem($type = 'products')
    {
        if (!$this->isConfigured()) return null;

        try {
            $response = Http::withBasicAuth($this->key, $this->secret)
                ->withOptions(['verify' => app()->isProduction()])
                ->get(rtrim($this->url, '/') . "/wp-json/wc/v3/{$type}", [
                    'per_page' => 1
                ]);

            if ($response->successful()) {
                $items = $response->json();
                return $items[0] ?? null;
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * همگام‌سازی دسته‌بندی‌ها - اصلاح شده برای پر کردن wp_id و parent_id
     */
    public function syncCategoriesMapped($mapping, $page = 1, $perPage = 20)
    {
        if (!$this->isConfigured()) return ['success' => false, 'message' => 'تنظیمات وردپرس کامل نیست.'];

        try {
            $response = Http::withBasicAuth($this->key, $this->secret)
                ->withOptions(['verify' => app()->isProduction()])
                ->get(rtrim($this->url, '/') . '/wp-json/wc/v3/products/categories', [
                    'per_page' => $perPage,
                    'page' => $page,
                    'hide_empty' => false,
                ]);

            if ($response->successful()) {
                $categories = $response->json();
                $totalCats = (int) $response->header('X-WP-Total');
                $totalPages = (int) $response->header('X-WP-TotalPages');

                $created = 0;
                $updated = 0;

                if (empty($categories)) {
                    return [
                        'success' => true,
                        'finished' => true,
                        'processed_count' => 0,
                        'total_remote' => $totalCats
                    ];
                }

                foreach ($categories as $cat) {
                    // دریافت ID واقعی وردپرس
                    $wpId = Arr::get($cat, 'id');
                    $title = Arr::get($cat, $mapping['title'] ?? 'name');
                    
                    if (!$title || !$wpId) continue;

                    $slug = Arr::get($cat, $mapping['slug'] ?? 'slug');
                    if (empty($slug)) {
                        $slug = Str::slug($title);
                    }

                    // هندل کردن تصویر/آیکون
                    $icon = isset($mapping['image']) ? Arr::get($cat, $mapping['image']) : null;
                    if(is_array($icon)) $icon = $icon['src'] ?? null;

                    // منطق والد/فرزند اصلاح شده
                    $parentId = null;
                    // در ووکامرس 'parent' حاوی ID والد در وردپرس است
                    $wpParentId = isset($cat['parent']) ? (int)$cat['parent'] : 0;
                    
                    if ($wpParentId > 0) {
                        // جستجو در دیتابیس خودمان بر اساس wp_id
                        $parentCat = Category::where('wp_id', $wpParentId)->first();
                        if ($parentCat) {
                            $parentId = $parentCat->id;
                        }
                    }

                    // تلاش برای پیدا کردن رکورد موجود
                    $category = Category::where('wp_id', $wpId)->first();
                    
                    // اگر با wp_id پیدا نشد، با slug چک کن تا از تکرار جلوگیری شود
                    if (!$category) {
                        $category = Category::where('slug', $slug)->first();
                    }

                    if ($category) {
                        $category->update([
                            'wp_id' => $wpId, // حتما wp_id را ذخیره کن
                            'title' => $title,
                            'slug' => $slug,
                            'parent_id' => $parentId ?: $category->parent_id, // اگر والد پیدا شد آپدیت کن، وگرنه قبلی بماند
                            'icon' => $icon ?: $category->icon,
                        ]);
                        $updated++;
                    } else {
                        Category::create([
                            'wp_id' => $wpId,
                            'title' => $title,
                            'slug' => $slug,
                            'parent_id' => $parentId,
                            'icon' => $icon,
                            'is_active' => true
                        ]);
                        $created++;
                    }
                }

                return [
                    'success' => true,
                    'finished' => $page >= $totalPages,
                    'next_page' => $page + 1,
                    'processed_created' => $created,
                    'processed_updated' => $updated,
                    'total_remote' => $totalCats,
                    'current_page' => $page
                ];
            } else {
                return ['success' => false, 'message' => 'خطا در ارتباط با وردپرس: ' . $response->status()];
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'خطا: ' . $e->getMessage()];
        }
    }

    /**
     * همگام‌سازی محصولات - اصلاح شده برای اتصال صحیح به دسته‌بندی
     */
    public function syncProductsMapped($mapping, $page = 1, $perPage = 20)
    {
        if (!$this->isConfigured()) return ['success' => false, 'message' => 'تنظیمات وردپرس کامل نیست.'];

        try {
            $response = Http::withBasicAuth($this->key, $this->secret)
                ->withOptions(['verify' => app()->isProduction()])
                ->get(rtrim($this->url, '/') . '/wp-json/wc/v3/products', [
                    'per_page' => $perPage,
                    'page' => $page,
                    'status' => 'publish',
                ]);

            if ($response->successful()) {
                $products = $response->json();
                $totalProducts = (int) $response->header('X-WP-Total');
                $totalPages = (int) $response->header('X-WP-TotalPages');
                
                $created = 0;
                $updated = 0;

                if (empty($products)) {
                    return [
                        'success' => true,
                        'finished' => true,
                        'processed_count' => 0,
                        'total_remote' => $totalProducts
                    ];
                }

                foreach ($products as $prod) {
                    $wpId = Arr::get($prod, 'id');
                    $title = Arr::get($prod, $mapping['title'] ?? 'name');
                    
                    if (!$wpId || !$title) continue;

                    $modelName = Arr::get($prod, $mapping['model_name'] ?? 'sku');
                    $description = strip_tags(Arr::get($prod, $mapping['description'] ?? 'short_description'));
                    $image = Arr::get($prod, $mapping['image'] ?? 'images.0.src');
                    
                    // منطق پیدا کردن دسته‌بندی
                    $categoryId = null;
                    
                    // کلید دسته‌بندی در مپینگ (پیش‌فرض 'categories')
                    $catKey = $mapping['category'] ?? 'categories';
                    $rawCats = Arr::get($prod, $catKey);

                    // ووکامرس آرایه‌ای از دسته‌ها را می‌فرستد: [{id: 10, name: 'Mobile', ...}]
                    // ما باید id داخلی (wp_id) را برداریم و در دیتابیس خودمان جستجو کنیم
                    if (is_array($rawCats) && !empty($rawCats)) {
                        // معمولاً اولین دسته، دسته اصلی است
                        $firstCat = $rawCats[0];
                        $wpCatId = isset($firstCat['id']) ? $firstCat['id'] : null;
                        
                        if ($wpCatId) {
                            $category = Category::where('wp_id', $wpCatId)->first();
                            if ($category) {
                                $categoryId = $category->id;
                            }
                        }
                    }

                    $existingProduct = Product::where('wp_id', $wpId)->orWhere(function($q) use ($modelName) {
                        if ($modelName) {
                            $q->where('model_name', $modelName);
                        }
                    })->first();

                    if ($existingProduct) {
                        $existingProduct->update([
                            'wp_id' => $wpId,
                            'title' => $title,
                            'model_name' => $modelName,
                            'description' => $description,
                            'image' => $image ?: $existingProduct->image,
                            'category_id' => $categoryId ?: $existingProduct->category_id, // اگر دسته پیدا نشد، قبلی را نگه دار
                        ]);
                        $updated++;
                    } else {
                        Product::create([
                            'wp_id' => $wpId,
                            'title' => $title,
                            'model_name' => $modelName,
                            'description' => $description,
                            'image' => $image,
                            'category_id' => $categoryId,
                            'points_value' => 0,
                            'is_active' => true
                        ]);
                        $created++;
                    }
                }

                return [
                    'success' => true,
                    'finished' => $page >= $totalPages,
                    'next_page' => $page + 1,
                    'processed_created' => $created,
                    'processed_updated' => $updated,
                    'total_remote' => $totalProducts,
                    'current_page' => $page
                ];
            } else {
                return ['success' => false, 'message' => 'خطا در ارتباط با وردپرس: ' . $response->status()];
            }

        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'خطا: ' . $e->getMessage()];
        }
    }
}