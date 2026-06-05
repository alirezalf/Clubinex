<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductRegistration;
use App\Models\ProductSerial;
use App\Services\ProductService;
use App\Http\Requests\Product\RegisterProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $category_id = $request->input('category_id');

        $productsQuery = Product::with('category')->latest();
        if ($search) {
            $productsQuery->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('model_name', 'like', "%{$search}%");
            });
        }
        if ($category_id) {
            $productsQuery->where('category_id', $category_id);
        }

        $products = $productsQuery->paginate(12)->appends($request->all());
        $categories = \Illuminate\Support\Facades\Cache::remember('product_categories_list', 3600, function() {
            return Category::select('id', 'title', 'slug', 'parent_id', 'icon')->get();
        });

        $user = Auth::user();

        $rawRegistrations = ProductRegistration::with('category')
            ->where('user_id', $user->id)
            ->where('status', '!=', 'approved') // Only pending/rejected show as hand requests
            ->latest()
            ->take(50)
            ->get();

        // Pre-fetch exact matching products to reduce N+1 queries
        $productNames = $rawRegistrations->pluck('product_name')->map(fn($name) => trim($name))->filter()->unique();
        $exactProducts = $productNames->isNotEmpty() ? Product::whereIn('title', $productNames)->select('id', 'title', 'display_image')->get()->keyBy('title') : collect();

        $missingNames = $productNames->diff($exactProducts->keys());
        $partialProducts = collect();
        if ($missingNames->isNotEmpty()) {
            $partialQuery = Product::query()->select('id', 'title', 'display_image');
            foreach ($missingNames as $name) {
                $partialQuery->orWhere('title', 'like', '%' . $name . '%');
            }
            $partialProducts = $partialQuery->get();
        }

        $myRegistrations = $rawRegistrations->map(function($reg) use ($exactProducts, $partialProducts) {
                // جستجو برای یافتن محصول سیستمی و خواندن عکس پیش‌فرض آن
                $trimmedName = trim($reg->product_name);
                $systemProduct = $exactProducts->get($trimmedName);

                if (!$systemProduct) {
                    $systemProduct = $partialProducts->first(function($p) use ($trimmedName) {
                        return str_contains($p->title, $trimmedName);
                    });
                }
                $displayImage = $reg->product_image ?: ($systemProduct ? $systemProduct->display_image : null);

                return [
                    'id' => 'reg_' . $reg->id,
                    'real_id' => $reg->id,
                    'type' => 'registration',
                    'serial_code' => $reg->serial_code,
                    'product_title' => $reg->product_name,
                    'product_model' => $reg->product_model,
                    'product_image' => $displayImage,
                    'points_earned' => $reg->estimated_points ?? 0,
                    'registered_at' => $reg->created_at_jalali,
                    'warranty_status' => collect([
                        'request_activation' => 'درخواست فعال‌سازی',
                        'already_active' => 'فعال از قبل',
                        'no_guarantee' => 'بدون گارانتی'
                    ])->get($reg->warranty_status, 'نامشخص'),
                    'status' => $reg->status,
                    'status_farsi' => $reg->status_farsi,
                    'admin_note' => $reg->admin_note,
                    'can_delete' => $reg->status === 'pending',
                    'can_edit' => $reg->status === 'pending',
                ];
            });

        // Since we excluded 'approved' registrations, we don't need to filter them out anymore.
        // Approved hand registrations will correctly show up as 'serial' now.
        $mySerials = ProductSerial::with(['product', 'registration'])
            ->where('is_used', true)
            ->where('used_by', $user->id)
            ->latest('used_at')
            ->take(100)
            ->get()
            ->map(function($serial) {
                $points = 50;
                if ($serial->product && $serial->product->points_value > 0) {
                    $points = $serial->product->points_value;
                }

                // If it was a manual registration, we can get image and warranty status
                $warrantyStatus = null;
                $displayImage = $serial->product ? $serial->product->display_image : null;

                if ($serial->registration) {
                    $warrantyStatus = collect([
                        'request_activation' => 'درخواست فعال‌سازی',
                        'already_active' => 'فعال از قبل',
                        'no_guarantee' => 'بدون گارانتی'
                    ])->get($serial->registration->warranty_status, 'نامشخص');

                    if (!$displayImage && $serial->registration->product_image) {
                        $displayImage = $serial->registration->product_image;
                    }
                }

                return [
                    'id' => 'ser_' . $serial->id,
                    'real_id' => $serial->id,
                    'type' => 'serial',
                    'serial_code' => $serial->serial_code,
                    'product_title' => $serial->product ? $serial->product->title : ($serial->registration ? $serial->registration->product_name : 'نامشخص'),
                    'product_model' => $serial->product ? $serial->product->model_name : ($serial->registration ? $serial->registration->product_model : 'نامشخص'),
                    'product_image' => $displayImage,
                    'warranty_status' => $warrantyStatus,
                    'points_earned' => $points,
                    'registered_at' => \Morilog\Jalali\Jalalian::fromDateTime($serial->used_at)->format('Y/m/d H:i'),
                    'status' => 'approved',
                    'status_farsi' => 'تایید شده (آنی)',
                    'can_delete' => false,
                    'can_edit' => false,
                ];
            });

        $myProducts = collect($myRegistrations)->merge($mySerials)->sortByDesc('registered_at')->values()->all();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
            'myProducts' => $myProducts
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::select('id', 'title', 'slug', 'parent_id', 'icon')->get(),
            'agentInfo' => Auth::user()->isAgent() ? ['mobile' => Auth::user()->mobile] : null
        ]);
    }

    public function registerProduct(RegisterProductRequest $request)
    {
        try {
            $this->productService->createRegistrationRequest(
                Auth::user(),
                $request->validated(),
                $request->file('tool_pic_file'),
                $request->file('invoice_file')
            );
            return redirect()->route('products.index')->with('message', 'درخواست ثبت محصول با موفقیت ارسال شد و پس از بررسی تیم پشتیبانی اعمال خواهد شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در ثبت محصول: ' . $e->getMessage());
        }
    }

    public function editRegistration($id)
    {
        $registration = ProductRegistration::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->findOrFail($id);

        return Inertia::render('Products/Create', [
            'categories' => Category::select('id', 'title', 'slug', 'parent_id', 'icon')->get(),
            'editingRegistration' => [
                'id' => $registration->id,
                'tool_name' => $registration->product_name,
                'tool_model' => $registration->product_model,
                'tool_brand_name' => $registration->product_brand,
                'tool_serial' => $registration->serial_code,
                'category_id' => $registration->category_id,
                'customer_user' => $registration->customer_type,
                'customer_mobile_number' => $registration->customer_mobile,
                'seller_user' => $registration->seller_type,
                'seller_mobile_number' => $registration->seller_mobile,
                'introducer_user' => $registration->introducer_type,
                'introducer_mobile_number' => $registration->introducer_mobile,
                'guarantee_status' => match($registration->warranty_status) {
                    'request_activation' => 'reg_guarantee',
                    'already_active' => 'pre_guarantee',
                    default => 'no_guarantee',
                },
                'product_image_url' => $registration->product_image,
                'invoice_image_url' => $registration->invoice_image,
            ]
        ]);
    }

    public function updateRegistration(RegisterProductRequest $request, $id)
    {
        try {
            $this->productService->updateRegistrationRequest(
                Auth::user(),
                $id,
                $request->validated(),
                $request->file('tool_pic_file'),
                $request->file('invoice_file')
            );
            return redirect()->route('products.index')->with('message', 'درخواست ثبت محصول با موفقیت ویرایش شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در ویرایش محصول: ' . $e->getMessage());
        }
    }

    public function destroyRegistration($id)
    {
        try {
            $this->productService->deleteRegistrationRequest(Auth::user(), $id);
            return back()->with('message', 'درخواست ثبت محصول با موفقیت حذف شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در حذف درخواست: ' . $e->getMessage());
        }
    }

    public function checkSerial(Request $request)
    {
        $request->validate(['serial_code' => 'required|string']);

        try {
            if ($request->boolean('register')) {
                $result = $this->productService->registerBySerial(Auth::user(), $request->serial_code);

                if ($request->expectsJson()) {
                    return response()->json([
                        'valid' => true,
                        'message' => "محصول {$result['product_name']} با موفقیت ثبت شد و {$result['points']} امتیاز دریافت کردید.",
                        'product' => $result
                    ]);
                }

                return back()->with('message', "محصول {$result['product_name']} با موفقیت ثبت شد و {$result['points']} امتیاز دریافت کردید.");
            }

            $checkResult = $this->productService->checkSerial($request->serial_code, Auth::id());

            if ($request->expectsJson()) {
                if (!$checkResult['valid']) {
                    return response()->json(['valid' => false, 'message' => $checkResult['message']], 404);
                }
                return response()->json([
                    'valid' => true,
                    'product' => $checkResult['product'],
                    'points' => $checkResult['points']
                ]);
            }

            if (!$checkResult['valid']) {
                return back()->with('error', $checkResult['message']);
            }

            return back()->with('checkResult', [
                'valid' => true,
                'product' => $checkResult['product'],
                'points' => $checkResult['points']
            ]);

        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json(['valid' => false, 'message' => $e->getMessage()], 400);
            }
            return back()->with('error', $e->getMessage());
        }
    }
}
