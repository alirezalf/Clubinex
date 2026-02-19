<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'mobile' => '09' . $this->faker->unique()->numberBetween(100000000, 999999999),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // رمز عبور پیش‌فرض
            'remember_token' => Str::random(10),
            'profile_completed' => $this->faker->boolean(80),
            'national_code' => $this->faker->unique()->numerify('##########'),
            // مقدار پیش‌فرض برای status_id (معمولاً در UserSeeder اورراید می‌شود)
            'status_id' => 1, 
            'current_points' => $this->faker->numberBetween(0, 5000),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}