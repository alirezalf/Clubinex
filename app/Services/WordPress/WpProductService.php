<?php

namespace App\Services\WordPress;

use Illuminate\Support\Facades\Http;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Arr;

class WpProductService extends BaseWordPressService
{
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

                // Pre-load required categories
                $wpCatIds = [];
                $wpProductIds = [];
                $modelNames = [];

                foreach ($products as $prod) {
                    if ($wpId = Arr::get($prod, 'id')) $wpProductIds[] = $wpId;
                    if ($modelName = Arr::get($prod, $mapping['model_name'] ?? 'sku')) $modelNames[] = $modelName;

                    $catKey = $mapping['category'] ?? 'categories';
                    $rawCats = Arr::get($prod, $catKey);
                    if (is_array($rawCats) && !empty($rawCats) && isset($rawCats[0]['id'])) {
                        $wpCatIds[] = $rawCats[0]['id'];
                    }
                }

                $categoriesMap = Category::whereIn('wp_id', array_filter(array_unique($wpCatIds)))
                    ->pluck('id', 'wp_id')
                    ->toArray();

                $existingProducts = Product::withTrashed()
                    ->where(function($query) use ($wpProductIds, $modelNames) {
                        $query->whereIn('wp_id', array_filter(array_unique($wpProductIds)));
                        if (!empty(array_filter($modelNames))) {
                            $query->orWhereIn('model_name', array_filter(array_unique($modelNames)));
                        }
                    })
                    ->get();

                $productsByWpId = $existingProducts->keyBy('wp_id');
                $productsByModelName = $existingProducts->whereNotNull('model_name')->keyBy('model_name');

                foreach ($products as $prod) {
                    $wpId = Arr::get($prod, 'id');
                    $title = Arr::get($prod, $mapping['title'] ?? 'name');

                    if (!$wpId || !$title) continue;

                    $modelName = Arr::get($prod, $mapping['model_name'] ?? 'sku');
                    $description = strip_tags(Arr::get($prod, $mapping['description'] ?? 'short_description'));
                    $image = Arr::get($prod, $mapping['image'] ?? 'images.0.src');

                    // اتصال به دسته‌بندی با استفاده از کشِ لود شده
                    $categoryId = null;
                    $catKey = $mapping['category'] ?? 'categories';
                    $rawCats = Arr::get($prod, $catKey);

                    if (is_array($rawCats) && !empty($rawCats)) {
                        $firstCat = $rawCats[0];
                        $wpCatId = isset($firstCat['id']) ? $firstCat['id'] : null;

                        if ($wpCatId && isset($categoriesMap[$wpCatId])) {
                            $categoryId = $categoriesMap[$wpCatId];
                        }
                    }

                    // پیدا کردن محصول از طریق مپ‌های لود شده
                    $existingProduct = $productsByWpId->get($wpId);
                    if (!$existingProduct && $modelName) {
                        $existingProduct = $productsByModelName->get($modelName);
                    }

                    if ($existingProduct) {
                        $existingProduct->update([
                            'wp_id' => $wpId,
                            'title' => $title,
                            'model_name' => $modelName,
                            'description' => $description,
                            'image' => $image ?: $existingProduct->image,
                            'category_id' => $categoryId ?: $existingProduct->category_id,
                            'deleted_at' => null // Restore if soft deleted
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
