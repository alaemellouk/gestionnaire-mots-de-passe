<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegisterVerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
    ) {
    }

    public function build()
    {
        return $this
            ->subject('Vérification de votre compte PassGuard')
            ->view('emails.register-verification-code')
            ->with([
                'code' => $this->code,
            ]);
    }
}
