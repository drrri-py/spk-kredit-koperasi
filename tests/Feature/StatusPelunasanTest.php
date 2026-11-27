<?php

namespace Tests\Feature;

use App\Models\Debitur;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatusPelunasanTest extends TestCase
{
    use RefreshDatabase;

    public function test_anggota_cannot_reapply_while_loan_is_unpaid_and_can_reapply_after_admin_marks_lunas(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('role', 'admin')->firstOrFail();
        $member = User::where('role', 'anggota')->firstOrFail();
        $debitur = Debitur::where('no_anggota', $member->no_anggota)->firstOrFail();

        // 1. Saat masih belum_lunas, anggota tidak bisa mengajukan pinjaman baru
        $blockedResponse = $this->actingAs($member)->post(route('anggota.pengajuan.store'), [
            'nik' => '3209012304850001',
            'unit_kerja' => 'Divisi Produksi',
            'alamat' => 'Jl. Fatahillah No. 12, Cirebon',
            'telepon' => '081234567890',
            'nominal_pengajuan' => 5000000,
            'tenor_bulan' => 12,
        ]);

        $blockedResponse->assertRedirect(route('anggota.dashboard'));
        $blockedResponse->assertSessionHas('error');
        $this->assertEquals(1, Debitur::where('no_anggota', $member->no_anggota)->count());

        // 2. Admin menandai pinjaman sebagai LUNAS
        $toggleResponse = $this->actingAs($admin)->patch(route('debitur.pelunasan', $debitur->id));
        $toggleResponse->assertRedirect(route('debitur.index'));
        $toggleResponse->assertSessionHas('success');
        $this->assertEquals('lunas', $debitur->fresh()->status_pelunasan);

        // 3. Setelah lunas, anggota bisa mengajukan pinjaman baru
        $allowedResponse = $this->actingAs($member)->post(route('anggota.pengajuan.store'), [
            'nik' => '3209012304850001',
            'unit_kerja' => 'Divisi Produksi',
            'alamat' => 'Jl. Fatahillah No. 12, Cirebon',
            'telepon' => '081234567890',
            'nominal_pengajuan' => 5000000,
            'tenor_bulan' => 12,
        ]);

        $allowedResponse->assertRedirect(route('anggota.dashboard'));
        $allowedResponse->assertSessionHas('success');
        $this->assertEquals(2, Debitur::where('no_anggota', $member->no_anggota)->count());
    }
}
