<?php

namespace App\Support;

use App\Models\ActivityLog;

final class ActivityLogger
{
    public static function log(string $action, string $iconType = 'info'): void
    {
        ActivityLog::create([
            'id' => 'log-'.uniqid(),
            'action' => $action,
            'timestamp' => Timeline::now(),
            'iconType' => $iconType,
        ]);
    }
}
