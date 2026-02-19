<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProvinceSeeder extends Seeder
{
    public function run(): void
    {
        $provinces = [
            ['id' => 1, 'name' => 'آذربایجان شرقی'],
            ['id' => 2, 'name' => 'آذربایجان غربی'],
            ['id' => 3, 'name' => 'اردبیل'],
            ['id' => 4, 'name' => 'اصفهان'],
            ['id' => 5, 'name' => 'البرز'],
            ['id' => 6, 'name' => 'ایلام'],
            ['id' => 7, 'name' => 'بوشهر'],
            ['id' => 8, 'name' => 'تهران'],
            ['id' => 9, 'name' => 'چهارمحال و بختیاری'],
            ['id' => 10, 'name' => 'خراسان جنوبی'],
            ['id' => 11, 'name' => 'خراسان رضوی'],
            ['id' => 12, 'name' => 'خراسان شمالی'],
            ['id' => 13, 'name' => 'خوزستان'],
            ['id' => 14, 'name' => 'زنجان'],
            ['id' => 15, 'name' => 'سمنان'],
            ['id' => 16, 'name' => 'سیستان و بلوچستان'],
            ['id' => 17, 'name' => 'فارس'],
            ['id' => 18, 'name' => 'قزوین'],
            ['id' => 19, 'name' => 'قم'],
            ['id' => 20, 'name' => 'کردستان'],
            ['id' => 21, 'name' => 'کرمان'],
            ['id' => 22, 'name' => 'کرمانشاه'],
            ['id' => 23, 'name' => 'کهگیلویه و بویراحمد'],
            ['id' => 24, 'name' => 'گلستان'],
            ['id' => 25, 'name' => 'گیلان'],
            ['id' => 26, 'name' => 'لرستان'],
            ['id' => 27, 'name' => 'مازندران'],
            ['id' => 28, 'name' => 'مرکزی'],
            ['id' => 29, 'name' => 'هرمزگان'],
            ['id' => 30, 'name' => 'همدان'],
            ['id' => 31, 'name' => 'یزد'],
        ];

        DB::table('provinces')->upsert($provinces, ['id'], ['name']);

        // Sample cities - In a real app this would be much larger
        // Just adding critical ones for functionality
        $cities = [
            ['province_id' => 8, 'name' => 'تهران'],
            ['province_id' => 8, 'name' => 'شهریار'],
            ['province_id' => 8, 'name' => 'اسلامشهر'],
            ['province_id' => 4, 'name' => 'اصفهان'],
            ['province_id' => 4, 'name' => 'کاشان'],
            ['province_id' => 17, 'name' => 'شیراز'],
            ['province_id' => 11, 'name' => 'مشهد'],
            ['province_id' => 25, 'name' => 'رشت'],
            ['province_id' => 27, 'name' => 'ساری'],
            ['province_id' => 5, 'name' => 'کرج'],
        ];

        foreach ($cities as $city) {
            DB::table('cities')->updateOrInsert(
                ['name' => $city['name'], 'province_id' => $city['province_id']],
                ['is_active' => true]
            );
        }
    }
}