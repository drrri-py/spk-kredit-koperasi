<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('debiturs', function (Blueprint $table) {
            $table->dropUnique(['no_anggota']);
            $table->index('no_anggota');
            $table->string('status_verifikasi', 30)->default('draft')->change();
            $table->enum('status_pelunasan', ['belum_lunas', 'lunas'])
                ->default('belum_lunas')
                ->after('status_verifikasi');
        });
    }

    public function down(): void
    {
        Schema::table('debiturs', function (Blueprint $table) {
            $table->dropColumn('status_pelunasan');
            $table->dropIndex(['no_anggota']);
            $table->unique('no_anggota');
        });
    }
};
