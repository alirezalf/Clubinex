<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductSerial;
use App\Models\ProductRegistration;
use App\Models\Agent;
use App\Services\ProductService;
use App\Http\Requests\Product\RegisterProductRequest; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Morilog\Jalali\Jalalian;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index(Request $request)
    {
        $query = Product::where('is_active', true)->with('category');

        if ($request->category_id) {
            $catIds = Category::where('id', $request->category_id)
                ->orWhere('parent_id', $request->category_id)
                ->pluck('id')
                ->toArray();

            $query->whereIn('category_id', $catIds);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('model_name', 'like', "%{$request->search}%");
            });
        }

        $products = $query->latest()->paginate(12)->withQueryString();

        $products->getCollection()->transform(function($p) {
            $p->image_url = $p->display_image;
            return $p;
        });

        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => function($q) {
                $q->where('is_active', true);
            }])
            ->get();

        $myProducts = ProductSerial::where('used_by', Auth::id())
            ->with(['product.category'])
            ->latest('used_at')
            ->get()
            ->map(function ($serial) {
                return [
                    'id' => $serial->id,
                    'type' => 'serial',
                    'serial_code' => $serial->serial_code,
                    'product_title' => $serial->product->title,
                    'product_model' => $serial->product->model_name,
                    'product_image' => $serial->product->display_image,
                    'points_earned' => $serial->product->points_value,
                    'registered_at' => $serial->used_at ? Jalalian::fromDateTime($serial->used_at)->format('Y/m/d') : '-',
                    'status' => 'approved',
                    'status_farsi' => 'تایید شده',
                    'can_delete' => false,
                    'can_edit' => false
                ];
            });

        $myRegistrations = ProductRegistration::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($reg) {
                return [
                    'id' => $reg->id,
                    'type' => 'registration',
                    'serial_code' => $reg->serial_code,
                    'product_title' => $reg->product_name,
                    'product_model' => $reg->product_model,
                    'product_image' => $reg->product_image,
                    'points_earned' => 0,
                    'registered_at' => Jalalian::fromDateTime($reg->created_at)->format('Y/m/d'),
                    'status' => $reg->status,
                    'status_farsi' => $reg->status_farsi,
                    'admin_note' => $reg->admin_note,
                    'can_delete' => $reg->status === 'pending',
                    'can_edit' => $reg->status === 'pending'
                ];
            });

        $allItems = $myProducts->concat($myRegistrations)->sortByDesc('registered_at')->values();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'search']),
            'myProducts' => $allItems
        ]);
    }

    public function create(Request $request)
    {
        $categories = Category::where('is_active', true)
            ->orderBy('parent_id')
            ->get()
            ->map(function($cat) {
                return [
                    'id' => $cat->id,
                    'title' => $cat->parent_id ? "── " . $cat->title : $cat->title,
                    'original_title' => $cat->title
                ];
            });

        $prefilledProduct = null;
        if ($request->product_id) {
            $product = Product::find($request->product_id);
            if ($product) {
                $prefilledProduct = [
                    'id' => $product->id,
                    'title' => $product->title,
                    'model_name' => $product->model_name,
                    'brand' => $product->brand,
                    'category_id' => $product->category_id,
                    'image' => $product->display_image
                ];
            }
        }

        $agentInfo = null;
        if (Auth::user()->isAgent()) {
             $agent = Agent::where('user_id', Auth::id())->first();
             if ($agent) {
                 $agentInfo = [
                     'store_name' => $agent->store_name,
                     'mobile' => Auth::user()->mobile
                 ];
             }
        }

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'prefilledProduct' => $prefilledProduct,
            'agentInfo' => $agentInfo
        ]);
    }

    public function checkSerial(Request $request)
    {
        $request->validate(['serial_code' => 'required|string|min:3']);

        $result = $this->productService->checkSerial(trim($request->serial_code), Auth::id());

        if (!$result['valid']) {
            return response()->json($result);
        }

        $product = $result['product'];
        return response()->json([
            'valid' => true,
            'message' => $result['message'],
            'product' => [
                'title' => $product->title,
                'model' => $product->model_name,
                'image' => $product->display_image,
                'points' => $result['points'],
                'category' => $product->category ? $product->category->title : null,
            ]
        ]);
    }

    public function registerProduct(RegisterProductRequest $request)
    {
        $user = Auth::user();
        
        if ($request->has('serial_code') && !$request->has('tool_name')) {
             try {
                $result = $this->productService->registerBySerial($user, trim($request->serial_code));
                return redirect()->route('products.index')->with('message', "محصول با موفقیت ثبت شد و {$result['points']} امتیاز دریافت کردید.");
            } catch (\Exception $e) {
                if ($e->getMessage() === 'SERIAL_NOT_FOUND') {
                    return back()->withErrors(['serial_code' => 'این کد سریال در سیستم شناسایی نشد. لطفاً از تب "ثبت کامل" استفاده کنید.']);
                }
                return back()->withErrors(['serial_code' => $e->getMessage()]);
            }
        }

        try {
            $this->productService->createRegistrationRequest(
                $user, 
                $request->validated(), 
                $request->file('tool_pic_file'), 
                $request->file('invoice_file')
            );
            
            return redirect()->route('products.index')->with('message', 'درخواست ثبت محصول شما با موفقیت ارسال شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در ثبت درخواست: ' . $e->getMessage());
        }
    }

    public function editRegistration($id)
    {
        $registration = ProductRegistration::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->findOrFail($id);

        $categories = Category::where('is_active', true)->orderBy('parent_id')->get()
            ->map(fn($cat) => ['id' => $cat->id, 'title' => $cat->parent_id ? "── " . $cat->title : $cat->title]);

        $agentInfo = null;
        if (Auth::user()->isAgent()) {
             $agent = Agent::where('user_id', Auth::id())->first();
             if ($agent) $agentInfo = ['store_name' => $agent->store_name, 'mobile' => Auth::user()->mobile];
        }

        $editingData = [
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
            'guarantee_status' => $registration->warranty_status,
            'product_image_url' => $registration->product_image,
            'invoice_image_url' => $registration->invoice_image,
        ];

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'agentInfo' => $agentInfo,
            'editingRegistration' => $editingData
        ]);
    }

    public function updateRegistration(Request $request, $id)
    {
        $rules = (new RegisterProductRequest)->rules();
        $rules['invoice_file'] = 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120'; 
        
        $validated = $request->validate($rules);

        try {
            $this->productService->updateRegistrationRequest(
                Auth::user(), 
                $id, 
                $validated,
                $request->file('tool_pic_file'),
                $request->file('invoice_file')
            );
            
            return redirect()->route('products.index')->with('message', 'درخواست ثبت محصول با موفقیت بروزرسانی شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در بروزرسانی: ' . $e->getMessage());
        }
    }

    public function destroyRegistration($id)
    {
        try {
            $this->productService->deleteRegistrationRequest(Auth::user(), $id);
            return back()->with('message', 'درخواست ثبت محصول با موفقیت حذف شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در حذف: ' . $e->getMessage());
        }
    }
}