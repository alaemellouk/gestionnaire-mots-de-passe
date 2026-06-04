<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    public const TYPE_AUTH = 'AUTH';
    public const TYPE_USER = 'USER';
    public const TYPE_ADMIN = 'ADMIN';
    public const TYPE_WARNING = 'WARNING';

    public const ACTION_ACCOUNT_VERIFIED = 'account.verified';
    public const ACTION_LOGIN_SUCCESS = 'login.success';
    public const ACTION_LOGIN_FAILED = 'login.failed';
    public const ACTION_PASSWORD_SAVED = 'password.saved';
    public const ACTION_PASSWORD_DELETED = 'password.deleted';
    public const ACTION_POLICY_UPDATED = 'policy.updated';
    public const ACTION_USER_ADDED = 'user.added';
    public const ACTION_USER_DELETED = 'user.deleted';

    public static function passwordResetFor(string $targetEmail, string $adminEmail): void
    {
        self::record(
            $adminEmail,
            'password.reset|' . $targetEmail,
            self::TYPE_ADMIN
        );
    }

    public static function record(string $userEmail, string $action, string $type): void
    {
        ActivityLog::create([
            'user_email' => $userEmail,
            'action' => $action,
            'type' => strtoupper($type),
            'created_at' => now(),
        ]);
    }
}
