<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kriterias', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 10)->unique(); // C1, C2, C3, C4, C5
            $table->string('nama_kriteria');
            $table->enum('tipe', ['benefit', 'cost']);
            $table->decimal('bobot_ahp', 8, 4)->default(0); // Misal: 0.3500
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kriterias');
    }
};