function randomIndex(max) {
  if (max <= 0) return 0;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function pickFrom(charset) {
  return charset[randomIndex(charset.length)];
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generatePasswordFromPolicy(rules, options = {}) {
  const minLen = rules.minLength ?? 12;
  const length = Math.max(minLen, Math.min(128, Number(options.length) || minLen));

  const includeUpper = rules.requireUppercase ? true : !!options.includeUppercase;
  const includeNumbers = rules.requireDigits ? true : !!options.includeNumbers;
  const includeSymbols = rules.requireSpecial ? true : !!options.includeSymbols;

  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.?";

  let alphabet = lower;
  if (includeUpper) alphabet += upper;
  if (includeNumbers) alphabet += digits;
  if (includeSymbols) alphabet += symbols;

  const required = [pickFrom(lower)];
  if (includeUpper) required.push(pickFrom(upper));
  if (includeNumbers) required.push(pickFrom(digits));
  if (includeSymbols) required.push(pickFrom(symbols));

  while (required.length < length) {
    required.push(pickFrom(alphabet));
  }

  return shuffle(required).slice(0, length).join("");
}

export function getPolicyGeneratorLocks(rules) {
  return {
    minLength: rules.minLength,
    lockedUppercase: !!rules.requireUppercase,
    lockedDigits: !!rules.requireDigits,
    lockedSpecial: !!rules.requireSpecial,
    hasLockedOptions: !!(rules.requireUppercase || rules.requireDigits || rules.requireSpecial),
  };
}
