<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penilaian_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debitur_id')->constrained('debiturs')->cascadeOnDelete();
            $table->foreignId('kriteria_id')->constrained('kriterias')->cascadeOnDelete();
            $table->decimal('nilai_skor', 8, 2); // Skor input matriks X
            $table->timestamps();

            $table->unique(['debitur_id', 'kriteria_id']); // Satu debitur hanya punya 1 skor per kriteria
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penilaian_details');
    }
};