const RULES = [
  { key: "min12", regex: /.{12,}/ },
  { key: "upper", regex: /[A-Z]/ },
  { key: "lower", regex: /[a-z]/ },
  { key: "digit", regex: /\d/ },
  { key: "symbol", regex: /[^A-Za-z0-9]/ },
];

export function getStrengthLevelKey(password) {
  const score = RULES.filter((rule) => rule.regex.test(password)).length;
  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  return "strong";
}

export function getMissingRuleKeys(password) {
  return RULES.filter((rule) => !rule.regex.test(password)).map((rule) => rule.key);
}
