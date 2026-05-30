<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductRegistration;
use App\Services\WordPress\WpProductService;
use App\Services\ProductService;
use App\Jobs\SyncWpProducts;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index()
    {
        $products = Product::with('category')->withCount(['serials', 'serials as used_serials_count' => function ($query) {
            $query->where('is_used', true);
        }])->latest()->paginate(10, ['*'], 'products_page');

        $registrations = ProductRegistration::with(['user', 'category', 'admin'])
            ->latest()
            ->paginate(10, ['*'], 'registrations_page');

        $registrations->getCollection()->transform(function ($reg) {
            $reg->created_at_jalali = $reg->created_at_jalali;
            $reg->status_farsi = $reg->status_farsi;
            $reg->append('estimated_points'); // Explicitly append accessor
            $reg->append('is_serial_valid'); // Append serial validation result
            return $reg;
        });

        $categories = Category::all();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'registrations' => $registrations,
            'categories' => $categories
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/products'), $filename);
            $validated['image'] = '/uploads/products/' . $filename;
        }

        Product::create($validated);

        return back()->with('message', 'محصول جدید با موفقیت ایجاد شد.');
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($product->image) {
                $relativePath = str_replace('/uploads/products/', '', $product->image);
                if (file_exists(public_path('uploads/products/' . $relativePath))) {
                    unlink(public_path('uploads/products/' . $relativePath));
                }
            }

            $file = $request->file('image');
            $filename = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/products'), $filename);
            $validated['image'] = '/uploads/products/' . $filename;
        }

        $product->update($validated);

        return back()->with('message', 'محصول با موفقیت ویرایش شد.');
    }

    public function destroy(Product $product)
    {
        $usedSerials = $product->serials()->where('is_used', true)->count();
        if ($usedSerials > 0) {
            return back()->with('error', 'این محصول دارای سریال‌های استفاده شده است و قابل حذف نیست.');
        }

        if ($product->image) {
            $relativePath = str_replace('/uploads/products/', '', $product->image);
            if (file_exists(public_path('uploads/products/' . $relativePath))) {
                unlink(public_path('uploads/products/' . $relativePath));
            }
        }

        $product->serials()->delete();
        $product->delete();

        return back()->with('message', 'محصول با موفقیت حذف شد.');
    }

    public function updateRegistrationStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string'
        ]);

        try {
            $this->productService->processRegistrationStatus(
                $id,
                $request->status,
                $request->admin_note,
                auth()->id()
            );

            return back()->with('message', 'وضعیت درخواست تغییر کرد.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    // --- WordPress Integration ---
    public function getWpSchema(WpProductService $wpService)
    {
        $sample = $wpService->getSampleItem('products');
        if (!$sample) {
            return response()->json(['error' => 'خطا در دریافت اطلاعات از وردپرس'], 500);
        }

        $keys = array_keys($sample);
        $keys[] = 'images.0.src';
        $keys[] = 'categories.0.name';
        $keys[] = 'categories';
        $keys[] = 'short_description';
        $keys[] = 'description';
        $keys[] = 'sku';
        $keys[] = 'price';

        return response()->json(['keys' => array_values(array_unique($keys))]);
    }

    public function syncMapped(Request $request, WpProductService $wpService)
    {
        $request->validate([
            'mapping' => 'required|array',
            'mapping.title' => 'required|string',
            'page' => 'integer|min:1',
            'background' => 'nullable|boolean'
        ]);

        if ($request->boolean('background')) {
            // Get total pages by fetching 1 item
            $response = \Illuminate\Support\Facades\Http::withBasicAuth(env('WP_KEY', config('services.wordpress.key')), env('WP_SECRET', config('services.wordpress.secret')))
                ->withOptions(['verify' => app()->isProduction()])
                ->get(rtrim(env('WP_URL', config('services.wordpress.url')), '/') . '/wp-json/wc/v3/products', [
                    'per_page' => 20,
                    'page' => 1,
                    'status' => 'publish',
                ]);

            if ($response->successful()) {
                $totalPages = (int) $response->header('X-WP-TotalPages') ?: 1;
                $jobs = [];
                for ($p = 1; $p <= $totalPages; $p++) {
                    $jobs[] = new SyncWpProducts($request->mapping, $p);
                }

                $batch = \Illuminate\Support\Facades\Bus::batch($jobs)->name('WP Products Sync')->dispatch();

                return response()->json([
                    'success' => true,
                    'message' => 'همگام‌سازی در پس‌زمینه آغاز شد. تعداد صفحات: ' . $totalPages,
                    'batch_id' => $batch->id
                ]);
            }

            // Fallback
            SyncWpProducts::dispatch($request->mapping, 1);
            return response()->json([
                'success' => true,
                'message' => 'همگام‌سازی در پس‌زمینه آغاز شد.'
            ]);
        }

        $page = $request->input('page', 1);
        set_time_limit(120);

        $result = $wpService->syncProductsMapped($request->mapping, $page, 20);

        if ($result['success']) {
            return response()->json($result);
        }

        return response()->json($result, 500);
    }
}
