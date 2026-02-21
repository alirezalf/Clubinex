<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ThemeService
{
    /**
     * List of allowed theme keys.
     */
    public static function getAllowedKeys(): array
    {
        return [
            'primary_color',
            'sidebar_bg',
            'sidebar_text',
            'sidebar_texture',
            'header_bg',
            'radius_size',
            'card_style',
            'card_shadow',
            'card_opacity',
            'sidebar_collapsed',
            'logo_url',
            'favicon_url'
        ];
    }

    /**
     * Get the active theme for a user (merging system defaults with user preferences).
     */
    public function getActiveTheme(?User $user = null): array
    {
        // 1. Get System Settings (Cached)
        $systemSettings = Cache::remember('global_settings_array', 3600, function () {
            return SystemSetting::getSettingsArray();
        });

        // Map system settings to theme keys
        $theme = [
            'primary_color' => $systemSettings['theme.primary_color'] ?? '#0284c7',
            'radius_size' => $systemSettings['theme.radius_size'] ?? '0.75rem',
            'sidebar_bg' => $systemSettings['theme.sidebar_bg'] ?? '#ffffff',
            'sidebar_text' => $systemSettings['theme.sidebar_text'] ?? '#1f2937',
            'sidebar_texture' => $systemSettings['theme.sidebar_texture'] ?? 'none',
            'header_bg' => $systemSettings['theme.header_bg'] ?? 'rgba(255,255,255,0.8)',
            'card_style' => $systemSettings['theme.card_style'] ?? 'default',
            'card_shadow' => $systemSettings['theme.card_shadow'] ?? 'sm',
            'card_opacity' => $systemSettings['theme.card_opacity'] ?? '1',
            'sidebar_collapsed' => filter_var($systemSettings['theme.sidebar_collapsed'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'logo_url' => $systemSettings['theme.logo_url'] ?? null,
            'favicon_url' => $systemSettings['theme.favicon_url'] ?? null,
        ];

        // 2. Override with User Preferences
        if ($user && !empty($user->theme_preferences) && is_array($user->theme_preferences)) {
            foreach ($user->theme_preferences as $key => $value) {
                if (!empty($value) && in_array($key, self::getAllowedKeys())) {
                    $theme[$key] = $value;
                }
            }
        }

        return $theme;
    }

    /**
     * Update user-specific theme preferences.
     */
    public function updateUserTheme(User $user, array $data): void
    {
        $allowedKeys = self::getAllowedKeys();
        $preferences = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedKeys)) {
                $preferences[$key] = $value;
            }
        }

        // Merge with existing preferences to avoid overwriting missing keys if partial update
        $currentPreferences = $user->theme_preferences ?? [];
        $user->theme_preferences = array_merge($currentPreferences, $preferences);
        $user->save();

        Log::info("User {$user->id} updated theme preferences.", $preferences);
    }

    /**
     * Update system-wide theme settings.
     */
    public function updateSystemTheme(array $data): void
    {
        $allowedKeys = self::getAllowedKeys();

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedKeys)) {
                SystemSetting::setValue('theme', $key, $value);
            }
        }

        // Clear cache
        Cache::forget('global_settings');
        Cache::forget('global_settings_array');

        Log::info("System theme settings updated.", $data);
    }

    /**
     * Reset user theme preferences.
     */
    public function resetUserTheme(User $user): void
    {
        $user->theme_preferences = null;
        $user->save();
        Log::info("User {$user->id} theme preferences reset.");
    }
}
