<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SawResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'debitur_id',
        'nilai_preferensi',
        'ranking',
        'status_kelayakan',
        'rekomendasi_plafon',
    ];

    public function debitur(): BelongsTo
    {
        return $this->belongsTo(Debitur::class);
    }
}