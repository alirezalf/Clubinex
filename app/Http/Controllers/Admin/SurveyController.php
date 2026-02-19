<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Survey;
use App\Models\SurveyQuestion;
use App\Models\ActivityLog;
use App\Http\Requests\Admin\Gamification\StoreSurveyRequest;
use App\Http\Requests\Admin\Gamification\UpdateSurveyRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    // Survey Methods
    public function store(StoreSurveyRequest $request)
    {
        $validated = $request->validated();

        $survey = Survey::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'slug' => Str::slug($validated['title']) . '-' . uniqid(),
            'is_active' => true,
            'is_public' => true,
            'max_attempts' => 1,
            'starts_at' => $validated['starts_at'] ?? now(),
            'ends_at' => $validated['ends_at'],
            'duration_minutes' => $validated['duration_minutes'],
        ]);

        ActivityLog::log('survey.created', "مسابقه جدید '{$survey->title}' ایجاد شد", [
            'admin_id' => auth()->id(),
            'model_id' => $survey->id,
            'action_group' => 'survey'
        ]);

        return back()->with('message', 'مسابقه با موفقیت ایجاد شد.');
    }

    public function update(UpdateSurveyRequest $request, $id)
    {
        $survey = Survey::findOrFail($id);
        $survey->update($request->validated());

        ActivityLog::log('survey.updated', "مسابقه '{$survey->title}' ویرایش شد", [
            'admin_id' => auth()->id(),
            'model_id' => $survey->id,
            'action_group' => 'survey'
        ]);

        return back()->with('message', 'مسابقه با موفقیت ویرایش شد.');
    }

    public function duplicate($id)
    {
        $originalSurvey = Survey::with('questions')->findOrFail($id);

        try {
            DB::beginTransaction();

            $newSurvey = $originalSurvey->replicate(['slug', 'created_at', 'updated_at', 'id']);

            $newSurvey->title = $originalSurvey->title . ' (کپی)';
            $newSurvey->slug = 'copy-' . uniqid() . '-' . Str::random(5);
            $newSurvey->is_active = false;
            $newSurvey->created_at = now();
            $newSurvey->updated_at = now();
            $newSurvey->save();

            foreach ($originalSurvey->questions as $question) {
                $newQuestion = $question->replicate(['id', 'survey_id', 'created_at', 'updated_at']);
                $newQuestion->survey_id = $newSurvey->id;
                $newQuestion->created_at = now();
                $newQuestion->updated_at = now();
                $newQuestion->save();
            }

            ActivityLog::log('survey.duplicated', "مسابقه '{$originalSurvey->title}' کپی شد", [
                'admin_id' => auth()->id(),
                'model_id' => $newSurvey->id,
                'action_group' => 'survey'
            ]);

            DB::commit();
            return back()->with('message', 'مسابقه با موفقیت کپی شد. اکنون می‌توانید آن را ویرایش کنید.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'خطا در کپی مسابقه: ' . $e->getMessage());
        }
    }

    public function toggle($id)
    {
        $survey = Survey::findOrFail($id);
        $survey->update(['is_active' => !$survey->is_active]);

        return back()->with('message', 'وضعیت مسابقه تغییر کرد.');
    }

    public function destroy($id)
    {
        $survey = Survey::findOrFail($id);

        if ($survey->answers()->count() > 0) {
            return back()->with('error', 'این مسابقه دارای شرکت‌کننده است و نمی‌توان آن را حذف کرد. می‌توانید آن را غیرفعال کنید.');
        }

        $survey->delete();

        ActivityLog::log('survey.deleted', "مسابقه '{$survey->title}' حذف شد", [
            'admin_id' => auth()->id(),
            'model_id' => $id,
            'action_group' => 'survey'
        ]);

        return back()->with('message', 'مسابقه با موفقیت حذف شد.');
    }

    // Question Management Methods
    public function questions($id)
    {
        $survey = Survey::findOrFail($id);
        $questions = $survey->questions()->orderBy('order')->get();

        return Inertia::render('Admin/Gamification/Questions', [
            'survey' => $survey,
            'questions' => $questions
        ]);
    }

    public function storeQuestion(Request $request, $id)
    {
        $survey = Survey::findOrFail($id);

        $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:multiple_choice,text,number,rating',
            'options' => 'required_if:type,multiple_choice|array|min:2',
            'points' => 'required|integer',
            'correct_option' => 'nullable|required_if:type,multiple_choice|integer',
            'correct_text' => 'nullable|required_if:type,text|string',
            'correct_min' => 'nullable|required_if:type,number|numeric',
            'correct_max' => 'nullable|numeric',
        ]);

        $maxOrder = $survey->questions()->max('order') ?? 0;

        $correctAnswer = null;
        if ($request->type === 'multiple_choice') {
            $correctAnswer = ['selected_option' => $request->correct_option];
        } elseif ($request->type === 'text') {
            $correctAnswer = ['text' => $request->correct_text];
        } elseif ($request->type === 'number') {
            $correctAnswer = [
                'min' => $request->correct_min,
                'max' => $request->correct_max ?? $request->correct_min
            ];
        }

        SurveyQuestion::create([
            'survey_id' => $id,
            'question' => $request->question,
            'type' => $request->type,
            'options' => $request->type === 'multiple_choice' ? $request->options : null,
            'correct_answer' => $correctAnswer,
            'points' => $request->points,
            'is_required' => true,
            'order' => $maxOrder + 1
        ]);

        return back()->with('message', 'سوال جدید اضافه شد.');
    }

    public function updateQuestion(Request $request, $id)
    {
        $question = SurveyQuestion::findOrFail($id);
        
        $request->validate([
            'question' => 'required|string',
            'type' => 'required|in:multiple_choice,text,number,rating',
            'options' => 'required_if:type,multiple_choice|array|min:2',
            'points' => 'required|integer',
            'correct_option' => 'nullable|required_if:type,multiple_choice|integer',
            'correct_text' => 'nullable|required_if:type,text|string',
            'correct_min' => 'nullable|required_if:type,number|numeric',
            'correct_max' => 'nullable|numeric',
        ]);

        $correctAnswer = null;
        if ($request->type === 'multiple_choice') {
            $correctAnswer = ['selected_option' => $request->correct_option];
        } elseif ($request->type === 'text') {
            $correctAnswer = ['text' => $request->correct_text];
        } elseif ($request->type === 'number') {
            $correctAnswer = [
                'min' => $request->correct_min,
                'max' => $request->correct_max ?? $request->correct_min
            ];
        }

        $question->update([
            'question' => $request->question,
            'type' => $request->type,
            'options' => $request->type === 'multiple_choice' ? $request->options : null,
            'correct_answer' => $correctAnswer,
            'points' => $request->points,
        ]);

        return back()->with('message', 'سوال با موفقیت ویرایش شد.');
    }

    public function destroyQuestion($id)
    {
        SurveyQuestion::destroy($id);
        return back()->with('message', 'سوال حذف شد.');
    }
}