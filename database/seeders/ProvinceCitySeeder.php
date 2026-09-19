<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ProvinceCitySeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('seeders/json/ProvincesCitiesLight.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File not found: {$jsonPath}");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);

        DB::transaction(function () use ($data) {
            // پاک کردن جداول (اختیاری)
            // DB::table('cities')->truncate();
            // DB::table('provinces')->truncate();

            // درج دسته‌جمعی استان‌ها
            $provincesData = [];
            foreach ($data['provinces'] as $province) {
                $provincesData[] = [
                    'id' => $province['id'],
                    'name' => $province['name']
                ];
            }

            foreach ($provincesData as $province) {
                DB::table('provinces')->updateOrInsert(
                    ['id' => $province['id']],
                    ['name' => $province['name']]
                );
            }

            // درج دسته‌جمعی شهرها
            foreach ($data['cities'] as $city) {
                DB::table('cities')->updateOrInsert(
                    [
                        'province_id' => $city['province_id'],
                        'name' => $city['name']
                    ],
                    [
                        'is_active' => true,
                        'updated_at' => now(),
                        // created_at is only set on insert, Laravel's updateOrInsert doesn't do timestamps automatically for created_at, but we can rely on default or just manually provide it if needed.
                    ]
                );
            }
        });

        $this->command->info("✅ Seeding completed!");
        $this->command->info("Provinces: " . count($data['provinces']));
        $this->command->info("Cities: " . count($data['cities']));
    }
}
