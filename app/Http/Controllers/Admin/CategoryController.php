<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\WordPress\WpCategoryService;
use App\Http\Requests\Admin\Category\StoreCategoryRequest;
use App\Http\Requests\Admin\Category\UpdateCategoryRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with('parent')->withCount('products')->latest()->get();
        // Parents for dropdown (only root categories or 1 level deep to avoid deep nesting issues in simple UI)
        $parents = Category::whereNull('parent_id')->with('children')->get();
        
        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'parents' => $categories // Sending all for now as requested in UI
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        Category::create($request->validated());
        return back()->with('message', 'دسته‌بندی جدید ایجاد شد.');
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());
        return back()->with('message', 'دسته‌بندی بروزرسانی شد.');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return back()->with('error', 'این دسته‌بندی دارای محصول است و حذف نمی‌شود.');
        }
        
        if ($category->children()->count() > 0) {
            return back()->with('error', 'این دسته‌بندی دارای زیرمجموعه است.');
        }
        
        $category->delete();
        return back()->with('message', 'دسته‌بندی حذف شد.');
    }

    // WP Logic
    public function getWpSchema(WpCategoryService $wpService)
    {
        $sample = $wpService->getSampleItem('products/categories');
        if (!$sample) {
            return response()->json(['error' => 'خطا در دریافت اطلاعات از وردپرس'], 500);
        }
        
        $keys = array_keys($sample);
        if (!in_array('image.src', $keys)) $keys[] = 'image.src';
        
        // Remove duplicate keys to avoid React warnings
        $keys = array_values(array_unique($keys));
        
        return response()->json(['keys' => $keys]);
    }

    public function syncMapped(Request $request, WpCategoryService $wpService)
    {
        $request->validate([
            'mapping' => 'required|array',
            'mapping.title' => 'required|string',
            'page' => 'integer|min:1'
        ]);

        $page = $request->input('page', 1);
        set_time_limit(120);

        $result = $wpService->syncCategoriesMapped($request->mapping, $page, 50);

        if ($result['success']) {
            return response()->json($result);
        }
        return response()->json($result, 500);
    }
}