<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
    ) {
    }

    public function build()
    {
        return $this
            ->subject('Votre code de réinitialisation PassGuard')
            ->view('emails.reset-password-code')
            ->with([
                'code' => $this->code,
            ]);
    }
}

