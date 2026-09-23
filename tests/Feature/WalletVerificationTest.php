<?php

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;

test('a user cannot verify another users wallet transaction', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $wallet = Wallet::create([
        'user_id' => $owner->id,
        'balance' => 0,
    ]);
    $transaction = WalletTransaction::create([
        'wallet_id' => $wallet->id,
        'amount' => 10000,
        'type' => 'deposit',
        'status' => 'pending',
    ]);

    $this->actingAs($otherUser)
        ->get(route('wallet.verify', $transaction))
        ->assertNotFound();

    expect($transaction->refresh()->status)->toBe('pending');
});
