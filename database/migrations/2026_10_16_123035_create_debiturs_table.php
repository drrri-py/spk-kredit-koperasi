<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debiturs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('no_anggota', 30)->unique();
            $table->string('nama_lengkap', 100);
            $table->string('nik', 20)->nullable();
            $table->string('unit_kerja', 100)->nullable(); // Divisi/Unit di Koperasi Manunggal Perkasa
            $table->text('alamat');
            $table->string('telepon', 20);
            $table->decimal('nominal_pengajuan', 15, 2);
            $table->integer('tenor_bulan');
            $table->enum('status_verifikasi', ['draft', 'diverifikasi', 'ditolak'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debiturs');
    }
};