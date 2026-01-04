<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'start_date',
        'end_date',
        'status',
        'cancel_requested_at',
        'cancelled_at',
    ];

    protected $dates = ['start_date', 'end_date'];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' &&
            Carbon::now()->between($this->start_date, $this->end_date);
    }

    public function isCancelled(): bool
    {
        return $this->status === 'canceled' || $this->cancelled_at !== null;
    }

    public function isCancelRequested(): bool
    {
        return $this->cancel_requested_at !== null;
    }
}
