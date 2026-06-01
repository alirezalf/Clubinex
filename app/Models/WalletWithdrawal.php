<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletWithdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'amount',
        'bank_name',
        'iban_number',
        'card_number',
        'account_holder',
        'status',
        'admin_note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function getCreatedAtJalaliAttribute()
    {
        return \Morilog\Jalali\Jalalian::fromDateTime($this->created_at)->format('Y/m/d H:i');
    }
}
