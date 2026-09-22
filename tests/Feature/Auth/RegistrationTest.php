<?php

use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register'), [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'mobile' => '09123456789',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('registration requires a valid mobile number', function () {
    $response = $this->post(route('register'), [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'mobile' => '12345',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('mobile');
    $this->assertGuest();
});
