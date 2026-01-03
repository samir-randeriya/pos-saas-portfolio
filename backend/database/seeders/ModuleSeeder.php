<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            'sales',
            'inventory', 
            'reports',
            'customers',
        ];

        foreach ($modules as $moduleName) {
            Module::updateOrCreate(
                ['name' => $moduleName]
            );
        }
    }
}