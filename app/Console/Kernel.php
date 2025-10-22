<?php

namespace App\Console;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule($schedule)
    {
        $schedule->call([new \App\Http\Controllers\StatisticsController, 'expireLoyaltyPoints'])->daily();
    }
}