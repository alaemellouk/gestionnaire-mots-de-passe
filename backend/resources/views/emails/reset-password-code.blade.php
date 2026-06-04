<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PassGuard - Code de réinitialisation</title>
    <style>
      body { margin: 0; padding: 0; background: #0b1220; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
      .wrap { width: 100%; padding: 28px 16px; }
      .card { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.10); border-radius: 18px; overflow: hidden; }
      .hero { padding: 28px 28px 18px; background: radial-gradient(700px 360px at 15% 0%, rgba(99,102,241,0.35), transparent 55%), radial-gradient(650px 320px at 85% 0%, rgba(236,72,153,0.20), transparent 55%); }
      .brand { color: #e2e8f0; font-weight: 800; letter-spacing: -0.03em; font-size: 20px; }
      .subtitle { margin: 8px 0 0; color: rgba(226,232,240,0.78); font-size: 14px; line-height: 1.5; }
      .content { padding: 0 28px 26px; }
      .codeBox { margin: 18px 0 8px; padding: 16px 16px; border-radius: 14px; border: 1px dashed rgba(99,102,241,0.55); background: rgba(99,102,241,0.10); text-align: center; }
      .code { font-size: 28px; letter-spacing: 6px; font-weight: 900; color: #c7d2fe; }
      .hint { margin: 12px 0 0; color: rgba(226,232,240,0.72); font-size: 13px; line-height: 1.55; }
      .footer { padding: 16px 28px 22px; color: rgba(148,163,184,0.85); font-size: 12px; line-height: 1.55; border-top: 1px solid rgba(255,255,255,0.08); }
      .muted { color: rgba(148,163,184,0.8); }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div class="hero">
          <div class="brand">PassGuard</div>
          <p class="subtitle">Voici votre code de vérification pour réinitialiser votre mot de passe.</p>
        </div>

        <div class="content">
          <div class="codeBox">
            <div class="code">{{ $code }}</div>
          </div>
          <p class="hint">
            Ce code est valable <strong>15 minutes</strong>. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email.
          </p>
        </div>

        <div class="footer">
          <div class="muted">PassGuard — sécurité premium pour vos secrets.</div>
        </div>
      </div>
    </div>
  </body>
</html>

