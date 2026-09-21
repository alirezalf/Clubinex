<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('profile.update'), [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $user->refresh();

    expect($user->first_name)->toBe('Test');
    expect($user->last_name)->toBe('User');
    expect($user->email)->toBe('test@example.com');
});

test('email verification is reset when the email address changes', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('profile.update'), [
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => 'changed@example.com',
        ]);

    $response->assertSessionHasNoErrors();

    expect($user->refresh()->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('profile.update'), [
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});
