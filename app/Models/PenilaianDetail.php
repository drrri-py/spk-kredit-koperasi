<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenilaianDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'debitur_id',
        'kriteria_id',
        'nilai_skor',
    ];

    public function debitur(): BelongsTo
    {
        return $this->belongsTo(Debitur::class);
    }

    public function kriteria(): BelongsTo
    {
        return $this->belongsTo(Kriteria::class);
    }
}