<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Debitur extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'no_anggota',
        'nama_lengkap',
        'alamat',
        'telepon',
        'nominal_pengajuan',
        'tenor_bulan',
        'status_verifikasi',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DebiturDocument::class);
    }

    public function penilaianDetails(): HasMany
    {
        return $this->hasMany(PenilaianDetail::class);
    }

    public function sawResult(): HasOne
    {
        return $this->hasOne(SawResult::class);
    }
}