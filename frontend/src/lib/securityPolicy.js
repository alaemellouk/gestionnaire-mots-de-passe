export function mapApiPolicyToRules(data) {
  if (!data || typeof data !== "object") {
    return defaultPolicyRules();
  }

  const complexite = !!data.complexiteRequise;
  const rawLen = Number(data.longueurMinimale);
  const rawDays = Number(data.dureeValiditeJours);

  return {
    minLength: Math.min(128, Math.max(8, Number.isFinite(rawLen) ? rawLen : 12)),
    requireUppercase: boolOr(data.exiger_majuscules ?? data.exigerMajuscules, complexite),
    requireLowercase: boolOr(data.exiger_minuscules ?? data.exigerMinuscules, complexite),
    requireDigits: boolOr(data.exiger_chiffres ?? data.exigerChiffres, complexite),
    requireSpecial: boolOr(
      data.exiger_caracteres_speciaux ?? data.exigerCaracteresSpeciaux ?? data.exigerSpecial,
      complexite,
    ),
    validityDays: Number.isFinite(rawDays) ? Math.max(0, Math.min(365, rawDays)) : 0,
  };
}

function boolOr(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return !!value;
}

export function defaultPolicyRules() {
  return {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigits: true,
    requireSpecial: true,
    validityDays: 0,
  };
}

export function validateVaultPassword(password, rules, t) {
  const failureKeys = [];
  const pwd = String(password ?? "");

  if (pwd.length < rules.minLength) {
    failureKeys.push("passwords.policyErrorMinLength");
  }
  if (rules.requireUppercase && !/[A-Z]/.test(pwd)) {
    failureKeys.push("passwords.policyErrorUppercase");
  }
  if (rules.requireLowercase && !/[a-z]/.test(pwd)) {
    failureKeys.push("passwords.policyErrorLowercase");
  }
  if (rules.requireDigits && !/[0-9]/.test(pwd)) {
    failureKeys.push("passwords.policyErrorDigit");
  }
  if (rules.requireSpecial && !/[^a-zA-Z0-9]/.test(pwd)) {
    failureKeys.push("passwords.policyErrorSpecial");
  }

  return {
    valid: failureKeys.length === 0,
    failureKeys,
    messages: failureKeys.map((key) =>
      key === "passwords.policyErrorMinLength"
        ? t(key, { min: rules.minLength })
        : t(key),
    ),
  };
}

export function formatPolicyViolationsFromApi(data, t) {
  const list = data?.policy_violations ?? data?.errors;
  if (Array.isArray(list) && list.length > 0) {
    return list.map((line) => (typeof line === "string" ? line : String(line)));
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    return [data.message.trim()];
  }
  return [t("passwords.createError")];
}
