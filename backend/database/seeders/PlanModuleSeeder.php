<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $free = Plan::where('name', 'free')->first();
        $silver = Plan::where('name', 'silver')->first();
        $gold = Plan::where('name', 'gold')->first();

        $allModules = Module::all();

        $free->modules()->sync($allModules->pluck('id'));

        $silverModules = Module::whereIn('name', ['sales', 'inventory'])->get();
        $silver->modules()->sync($silverModules->pluck('id'));
        
        $goldModules = Module::whereIn('name', [
            'sales', 'inventory', 'customers', 'reports'
        ])->get();
        $gold->modules()->sync($goldModules->pluck('id'));
    }
}
