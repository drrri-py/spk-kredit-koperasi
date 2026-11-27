<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kriteria extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode',
        'nama_kriteria',
        'tipe',
        'bobot_ahp',
    ];

    public function subKriterias(): HasMany
    {
        return $this->hasMany(SubKriteria::class);
    }

    public function penilaianDetails(): HasMany
    {
        return $this->hasMany(PenilaianDetail::class);
    }
}