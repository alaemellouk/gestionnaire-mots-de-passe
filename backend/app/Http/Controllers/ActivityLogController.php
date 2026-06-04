<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->query('limit', 0);
        if ($limit > 0) {
            $limit = min($limit, 500);
        }

        $query = ActivityLog::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($limit > 0) {
            $query->limit($limit);
        }

        $logs = $query->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'user' => $log->user_email,
                'action' => $log->action,
                'type' => strtolower($log->type),
                'date' => $log->created_at?->format('Y-m-d H:i:s') ?? '',
            ]);

        return response()->json($logs);
    }
}
