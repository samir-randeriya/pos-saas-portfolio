<?php

namespace App\Console\Commands;

use App\Models\Impersonation;
use Illuminate\Console\Command;

class CleanupImpersonations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-impersonations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup expired impersonations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Impersonation::where('expires_at', '<', now())->delete();

        $this->info('Expired impersonations cleaned up.');
    }
}
