<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

test('verification notification can be sent', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->post('/email/verification-notification');

    Notification::assertSentTo($user, VerifyEmail::class);
    $response->assertRedirect();
});

test('verification notification is not sent when email is already verified', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user)->post('/email/verification-notification');

    Notification::assertNothingSent();
});
