<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'free', 
                'price' => 0, 
                'duration_days' => 14
            ],
            [
                'name' => 'silver', 
                'price' => 499, 
                'duration_days' => 30
            ],
            [
                'name' => 'gold', 
                'price' => 999, 
                'duration_days' => 30
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(
                ['name' => $planData['name']], // Search condition
                $planData // Data to update/create
            );
        }
    }
}