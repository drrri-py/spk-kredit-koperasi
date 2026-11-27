<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saw_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debitur_id')->constrained('debiturs')->cascadeOnDelete();
            $table->decimal('nilai_preferensi', 8, 4); // Nilai akhir Vi
            $table->integer('ranking');
            $table->enum('status_kelayakan', ['LAYAK', 'DIPERTIMBANGKAN', 'TIDAK LAYAK']);
            $table->decimal('rekomendasi_plafon', 15, 2)->default(0);
            $table->text('catatan_analisis')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saw_results');
    }
};