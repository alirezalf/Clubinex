<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use App\Models\Slide;
use App\Http\Requests\Admin\Slider\StoreSliderRequest;
use App\Http\Requests\Admin\Slider\UpdateSliderRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class SliderController extends Controller
{
    public function index()
    {
        $sliders = Slider::withCount('slides')->latest()->get();
        return Inertia::render('Admin/Sliders/Index', ['sliders' => $sliders]);
    }

    public function create()
    {
        return Inertia::render('Admin/Sliders/Form', [
            'availablePages' => $this->getAvailablePages()
        ]);
    }

    public function store(StoreSliderRequest $request)
    {
        $slider = Slider::create($request->validated());
        return redirect()->route('admin.sliders.edit', $slider->id)->with('message', 'اسلایدر ایجاد شد.');
    }

    public function edit(Slider $slider)
    {
        $slider->load(['slides' => function($q) {
            $q->orderBy('order');
        }]);

        return Inertia::render('Admin/Sliders/Form', [
            'slider' => $slider,
            'availablePages' => $this->getAvailablePages()
        ]);
    }

    public function update(UpdateSliderRequest $request, Slider $slider)
    {
        $slider->update($request->validated());
        return back()->with('message', 'تنظیمات اسلایدر بروزرسانی شد.');
    }

    public function destroy(Slider $slider)
    {
        foreach ($slider->slides as $slide) {
            if ($slide->image_path) {
                $relativePath = str_replace('/storage/', '', $slide->image_path);
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }
        }

        $slider->delete();
        return redirect()->route('admin.sliders.index')->with('message', 'اسلایدر حذف شد.');
    }

    public function storeSlide(Request $request, Slider $slider)
    {
        $request->validate([
            'image' => 'nullable|image|max:2048',
            'bg_text' => 'nullable|string',
            'bg_color' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'order' => 'integer',
        ]);

        if (!$request->hasFile('image') && !$request->bg_text && !$request->bg_color) {
            return back()->with('error', 'انتخاب تصویر، رنگ یا متن پس‌زمینه الزامی است.');
        }

        try {
            DB::beginTransaction();

            $path = null;
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('sliders', 'public');
                $path = Storage::url($path);
            }

            $data = $request->all();
            $data['slider_id'] = $slider->id;
            $data['image_path'] = $path;
            $data['is_active'] = true;
            // Default values for new fields
            $data['gap_y'] = $request->input('gap_y', 15);
            $data['desc_size'] = $request->input('desc_size', 'text-lg');

            Slide::create($data);

            DB::commit();
            return back()->with('message', 'اسلاید جدید اضافه شد.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در افزودن اسلاید: ' . $e->getMessage());
        }
    }

    public function updateSlide(Request $request, Slide $slide)
    {
        $data = $request->validate([
            'title' => 'nullable|string',
            'bg_text' => 'nullable|string',
            'bg_color' => 'nullable|string',
            'description' => 'nullable|string',
            'button_text' => 'nullable|string',
            'button_link' => 'nullable|string',
            'content_position' => 'nullable|string',
            'btn_relative_pos' => 'nullable|string',
            'btn_pos_type' => 'nullable|string',
            'btn_custom_pos' => 'nullable|string',
            'text_color' => 'nullable|string',
            'text_size' => 'nullable|string',
            'desc_color' => 'nullable|string',
            'desc_size' => 'nullable|string',
            'gap_y' => 'nullable|integer|min:0',
            'button_color' => 'nullable|string',
            'button_bg_color' => 'nullable|string',
            'button_size' => 'nullable|string',
            'anim_speed' => 'nullable|string',
            'text_anim_in' => 'nullable|string',
            'text_anim_out' => 'nullable|string',
            'btn_anim_in' => 'nullable|string',
            'btn_anim_out' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean',
            'remove_image' => 'boolean', // Flag for removing image
        ]);

        // Handle Image Removal
        if ($request->boolean('remove_image')) {
            if ($slide->image_path) {
                $relativePath = str_replace('/storage/', '', $slide->image_path);
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }
            $data['image_path'] = null;
        }

        // Handle New Image Upload
        if ($request->hasFile('image')) {
            $request->validate(['image' => 'image|max:2048']);

            if ($slide->image_path) {
                $relativePath = str_replace('/storage/', '', $slide->image_path);
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }

            $path = $request->file('image')->store('sliders', 'public');
            $data['image_path'] = Storage::url($path);
        }

        $slide->update($data);

        return back()->with('message', 'اسلاید ویرایش شد.');
    }

    public function destroySlide(Slide $slide)
    {
        if ($slide->image_path) {
            $relativePath = str_replace('/storage/', '', $slide->image_path);
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }

        $slide->delete();
        return back()->with('message', 'اسلاید حذف شد.');
    }

    public function duplicateSlide(Slide $slide)
    {
        try {
            $newSlide = $slide->replicate();
            $newSlide->title = $newSlide->title . ' (کپی)';
            $newSlide->order = $newSlide->order + 1;
            $newSlide->created_at = now();
            $newSlide->updated_at = now();
            $newSlide->save();

            return back()->with('message', 'اسلاید با موفقیت کپی شد.');
        } catch (\Exception $e) {
            return back()->with('error', 'خطا در کپی اسلاید.');
        }
    }

    private function getAvailablePages()
    {
        $routes = Route::getRoutes();
        $pages = [];

        foreach ($routes as $route) {
            $name = $route->getName();

            // فیلتر کردن روت‌های نامناسب
            if (
                !$name ||
                str_starts_with($name, 'sanctum') ||
                str_starts_with($name, 'ignition') ||
                str_starts_with($name, 'api.') ||
                str_starts_with($name, 'admin.') ||
                str_starts_with($name, 'login') ||
                str_starts_with($name, 'register') ||
                str_starts_with($name, 'password')
            ) {
                continue;
            }

            // فقط روت‌های GET که پارامتر اجباری ندارند
            if (in_array('GET', $route->methods())) {
                $pages[] = $name;
            }
        }

        $systemKeys = ['home_main'];

        return [
            'system' => $systemKeys,
            'pages' => array_unique($pages)
        ];
    }
}
