<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ahp_comparisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kriteria_1_id')->constrained('kriterias')->cascadeOnDelete();
            $table->foreignId('kriteria_2_id')->constrained('kriterias')->cascadeOnDelete();
            $table->decimal('nilai', 10, 4);
            $table->timestamps();

            $table->unique(['kriteria_1_id', 'kriteria_2_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ahp_comparisons');
    }
};
