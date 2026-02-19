<?php

namespace App\Services\WordPress;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;

class BaseWordPressService
{
    protected $url;
    protected $key;
    protected $secret;

    public function __construct()
    {
        $this->url = SystemSetting::getValue('wordpress', 'wp_url');
        $this->key = SystemSetting::getValue('wordpress', 'wp_consumer_key');
        $this->secret = SystemSetting::getValue('wordpress', 'wp_consumer_secret');
    }

    public function isConfigured()
    {
        return !empty($this->url) && !empty($this->key) && !empty($this->secret);
    }

    public function getSampleItem($type)
    {
        if (!$this->isConfigured()) return null;

        try {
            $response = Http::withBasicAuth($this->key, $this->secret)
                ->withOptions(['verify' => app()->isProduction()])
                ->get(rtrim($this->url, '/') . "/wp-json/wc/v3/{$type}", [
                    'per_page' => 1
                ]);

            if ($response->successful()) {
                $items = $response->json();
                return $items[0] ?? null;
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}