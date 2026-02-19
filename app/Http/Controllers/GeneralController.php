<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Product;

class GeneralController extends Controller
{
    public function getCities($provinceId)
    {
        $cities = DB::table('cities')
            ->where('province_id', $provinceId)
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();
            
        return response()->json($cities);
    }

    /**
     * جستجوی آسنکرون کاربران برای دراپ‌داون‌ها و انتخاب‌گرها
     */
    public function searchUsers(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json([]);
        }

        $users = User::query()
            ->select('id', 'first_name', 'last_name', 'mobile', 'avatar')
            ->where(function($q) use ($query) {
                $q->where('mobile', 'like', "%{$query}%")
                  ->orWhere('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$query}%");
            })
            ->active()
            ->limit(20) // محدود کردن نتایج برای کارایی بالا
            ->get();

        return response()->json($users);
    }

    public function lookupUser(Request $request)
    {
        $request->validate([
            'mobile' => 'required|string|min:10'
        ]);

        $user = User::where('mobile', $request->mobile)->first();

        if ($user) {
            return response()->json([
                'found' => true,
                'name' => $user->full_name,
                'id' => $user->id
            ]);
        }

        return response()->json([
            'found' => false,
            'message' => 'کاربر یافت نشد'
        ]);
    }

    /**
     * متد جدید برای جستجوی سراسری هدر
     */
    public function globalSearch(Request $request)
    {
        $query = trim($request->input('q'));
        $type = $request->input('type', 'product'); // پیش‌فرض روی محصول
        $user = Auth::user();
        $isAdmin = $user->hasRole(['super-admin', 'admin', 'staff']);

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];

        // 1. جستجوی محصولات (مشترک بین ادمین و کاربر)
        if ($type === 'product') {
            $products = Product::where('is_active', true)
                ->where(function($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('model_name', 'like', "%{$query}%");
                })
                ->limit(5)
                ->get();

            foreach ($products as $product) {
                // لینک مقصد: 
                // برای ادمین -> مدیریت محصولات با فیلتر
                // برای کاربر -> لیست محصولات با فیلتر (جایگزین صفحه ثبت مستقیم شد تا کاربر محصول را ببیند)
                $url = $isAdmin 
                    ? route('admin.products.index', ['search' => $product->title, 'tab' => 'inventory'])
                    : route('products.index', ['search' => $product->title]);

                $results[] = [
                    'id' => $product->id,
                    'title' => $product->title,
                    'subtitle' => $product->model_name ?? 'بدون مدل',
                    'image' => $product->display_image,
                    'type' => 'product',
                    'url' => $url
                ];
            }
        }

        // 2. جستجوی کاربران (فقط برای ادمین)
        if ($type === 'user' && $isAdmin) {
            $users = User::where(function($q) use ($query) {
                    $q->where('mobile', 'like', "%{$query}%")
                      ->orWhere('first_name', 'like', "%{$query}%")
                      ->orWhere('last_name', 'like', "%{$query}%")
                      ->orWhere('email', 'like', "%{$query}%")
                      ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%{$query}%");
                })
                ->limit(5)
                ->get();

            foreach ($users as $u) {
                $results[] = [
                    'id' => $u->id,
                    'title' => $u->full_name,
                    'subtitle' => $u->mobile,
                    'image' => $u->avatar,
                    'type' => 'user',
                    'url' => route('admin.users', ['search' => $u->mobile])
                ];
            }
        }

        return response()->json($results);
    }
}