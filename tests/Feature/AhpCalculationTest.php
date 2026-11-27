<?php

namespace Tests\Feature;

use App\Models\Kriteria;
use App\Models\User;
use App\Services\AhpCalculationService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AhpCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_ahp_calculation_computes_consistent_weights_from_seeded_comparisons(): void
    {
        $this->seed(DatabaseSeeder::class);

        $service = app(AhpCalculationService::class);
        $result = $service->calculate();

        $this->assertEquals(5, $result['n']);
        $this->assertTrue($result['is_consistent']);
        $this->assertLessThanOrEqual(0.10, $result['cr']);

        $weightSum = array_sum($result['weights']);
        $this->assertEqualsWithDelta(1.0, $weightSum, 0.005);

        $c1 = Kriteria::where('kode', 'C1')->firstOrFail();
        $this->assertEqualsWithDelta($result['weights']['C1'], (float) $c1->bobot_ahp, 0.0001);
    }

    public function test_admin_can_update_consistent_ahp_matrix_and_recalculate_weights(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('role', 'admin')->firstOrFail();
        $kriterias = Kriteria::orderBy('id')->get()->keyBy('kode');

        $response = $this->actingAs($admin)->post(route('kriteria.ahp.update'), [
            'comparisons' => [
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C2']->id, 'nilai' => 2],
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C3']->id, 'nilai' => 2],
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C4']->id, 'nilai' => 2],
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 2],
                ['kriteria_1_id' => $kriterias['C2']->id, 'kriteria_2_id' => $kriterias['C3']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C2']->id, 'kriteria_2_id' => $kriterias['C4']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C2']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C3']->id, 'kriteria_2_id' => $kriterias['C4']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C3']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C4']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 1],
            ],
        ]);

        $response->assertRedirect(route('kriteria.index'));
        $response->assertSessionHas('success');

        $c1 = Kriteria::where('kode', 'C1')->firstOrFail();
        $this->assertEqualsWithDelta(0.3333, (float) $c1->bobot_ahp, 0.001);
    }

    public function test_inconsistent_ahp_matrix_does_not_overwrite_bobot_ahp(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('role', 'admin')->firstOrFail();
        $kriterias = Kriteria::orderBy('id')->get()->keyBy('kode');
        $oldBobotC1 = (float) $kriterias['C1']->bobot_ahp;

        // Matriks sengaja dibuat tidak konsisten (C1 > C2 = 9, C2 > C3 = 9, tetapi C1 < C3 = 1/9)
        $response = $this->actingAs($admin)->post(route('kriteria.ahp.update'), [
            'comparisons' => [
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C2']->id, 'nilai' => 9],
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C3']->id, 'nilai' => 0.1111],
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C4']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C1']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C2']->id, 'kriteria_2_id' => $kriterias['C3']->id, 'nilai' => 9],
                ['kriteria_1_id' => $kriterias['C2']->id, 'kriteria_2_id' => $kriterias['C4']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C2']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C3']->id, 'kriteria_2_id' => $kriterias['C4']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C3']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 1],
                ['kriteria_1_id' => $kriterias['C4']->id, 'kriteria_2_id' => $kriterias['C5']->id, 'nilai' => 1],
            ],
        ]);

        $response->assertRedirect(route('kriteria.index'));
        $response->assertSessionHas('warning');

        $c1 = Kriteria::where('kode', 'C1')->firstOrFail();
        $this->assertEqualsWithDelta($oldBobotC1, (float) $c1->bobot_ahp, 0.0001);
    }
}
