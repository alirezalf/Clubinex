<?php

namespace App\Services\WordPress;

use Illuminate\Support\Facades\Http;
use App\Models\Category;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class WpCategoryService extends BaseWordPressService
{
    public function syncCategoriesMapped($mapping, $page = 1, $perPage = 50)
    {
        if (!$this->isConfigured()) return ['success' => false, 'message' => 'تنظیمات وردپرس کامل نیست.'];

        try {
            $response = Http::withBasicAuth($this->key, $this->secret)
                ->withOptions(['verify' => app()->isProduction()])
                ->get(rtrim($this->url, '/') . '/wp-json/wc/v3/products/categories', [
                    'per_page' => $perPage,
                    'page' => $page,
                    'hide_empty' => false,
                    'consumer_key' => $this->key,
                    'consumer_secret' => $this->secret,
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

                // Pre-load existing categories
                $wpIds = [];
                $slugs = [];
                foreach ($categories as $cat) {
                    if ($wpId = Arr::get($cat, $mapping['wp_id'] ?? 'id')) $wpIds[] = $wpId;

                    $title = Arr::get($cat, $mapping['title'] ?? 'name');
                    $slug = Arr::get($cat, $mapping['slug'] ?? 'slug');
                    if (empty($slug) && $title) {
                        $slug = Str::slug($title);
                    }
                    if ($slug) $slugs[] = $slug;
                }

                $existingCategories = Category::withTrashed()
                    ->where(function($query) use ($wpIds, $slugs) {
                        $query->whereIn('wp_id', array_filter(array_unique($wpIds)))
                              ->orWhereIn('slug', array_filter(array_unique($slugs)));
                    })
                    ->get();

                $categoriesByWpId = $existingCategories->keyBy('wp_id');
                $categoriesBySlug = $existingCategories->keyBy('slug');

                // --- مرحله اول: ایجاد یا بروزرسانی تمام دسته‌ها (بدون در نظر گرفتن والد) ---
                foreach ($categories as $cat) {
                    $wpId = Arr::get($cat, $mapping['wp_id'] ?? 'id');
                    $title = Arr::get($cat, $mapping['title'] ?? 'name');

                    if (!$title || !$wpId) continue;

                    $slug = Arr::get($cat, $mapping['slug'] ?? 'slug');
                    if (empty($slug)) {
                        $slug = Str::slug($title);
                    }

                    $icon = isset($mapping['image']) ? Arr::get($cat, $mapping['image']) : null;
                    if(is_array($icon)) $icon = $icon['src'] ?? null;

                    // جستجو بر اساس wp_id (اولویت) یا slug از مپ
                    $category = $categoriesByWpId->get($wpId);
                    if (!$category) {
                        $category = $categoriesBySlug->get($slug);
                    }

                    if ($category) {
                        $category->update([
                            'wp_id' => $wpId,
                            'title' => $title,
                            'slug' => $slug,
                            'icon' => $icon ?: $category->icon,
                            'deleted_at' => null // Restore if soft deleted
                        ]);
                        $updated++;
                    } else {
                        Category::create([
                            'wp_id' => $wpId,
                            'title' => $title,
                            'slug' => $slug,
                            'icon' => $icon,
                            'is_active' => true
                        ]);
                        $created++;
                    }
                }

                // --- مرحله دوم: آپدیت روابط والد/فرزند ---
                // این مرحله جداگانه انجام می‌شود تا مطمئن شویم والدها حتماً ساخته شده‌اند
                // مجددا همه دسته‌ها را برای روابط لود می‌کنیم
                $allAffectedWpIds = array_filter(array_unique(array_merge(
                    array_column($categories, $mapping['wp_id'] ?? 'id'),
                    array_column($categories, $mapping['parent_id'] ?? 'parent')
                )));
                $refreshCategoriesByWpId = Category::whereIn('wp_id', $allAffectedWpIds)->get()->keyBy('wp_id');

                foreach ($categories as $cat) {
                    $wpId = Arr::get($cat, $mapping['wp_id'] ?? 'id');
                    $wpParentId = (int) Arr::get($cat, $mapping['parent_id'] ?? 'parent', 0);

                    if ($wpId && $wpParentId > 0) {
                        // پیدا کردن دسته‌ی فرزند (که همین الان ساختیم/آپدیت کردیم)
                        $currentCat = $refreshCategoriesByWpId->get($wpId);

                        // پیدا کردن دسته‌ی والد در دیتابیس خودمان
                        $parentCat = $refreshCategoriesByWpId->get($wpParentId);

                        if ($currentCat && $parentCat) {
                            // فقط اگر والد تغییر کرده باشد آپدیت می‌کنیم
                            if ($currentCat->parent_id !== $parentCat->id) {
                                $currentCat->update(['parent_id' => $parentCat->id]);
                            }
                        }
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
}
