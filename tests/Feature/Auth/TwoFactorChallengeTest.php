<?php

use App\Models\User;
use Illuminate\Support\Facades\URL;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

beforeEach(function () {
    config(['fortify.features' => [
        Laravel\Fortify\Features::twoFactorAuthentication(['confirm' => true, 'confirmPassword' => true]),
    ]]);
});

test('two factor challenge can be rendered', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'two_factor_secret' => encrypt(app(Google2FA::class)->generateSecretKey()),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    $response = $this->actingAs($user)->get('/two-factor-challenge');

    $response->assertOk();
});

test('users can authenticate using two factor challenge', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'two_factor_secret' => encrypt(app(Google2FA::class)->generateSecretKey()),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    session()->put('login.id', $user->id);

    $response = $this->post('/two-factor-challenge', [
        'code' => app(Google2FA::class)->getCurrentOtp(decrypt($user->two_factor_secret)),
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('valid two factor recovery code allows authentication', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'two_factor_secret' => encrypt(app(Google2FA::class)->generateSecretKey()),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at' => now(),
    ])->save();

    session()->put('login.id', $user->id);

    $response = $this->post('/two-factor-challenge', [
        'recovery_code' => 'code1',
    ]);

    $this->assertAuthenticated();
});
