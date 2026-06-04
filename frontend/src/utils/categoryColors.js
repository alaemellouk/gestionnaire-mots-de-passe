const THEMES = [
  {
    accent: "#7c3aed",
    soft: "rgba(124, 58, 237, 0.38)",
    border: "rgba(167, 139, 250, 0.85)",
    glow: "rgba(124, 58, 237, 0.45)",
    badgeSoftDark: "rgba(167, 139, 250, 0.55)",
    badgeSoftLight: "rgba(196, 181, 254, 0.92)",
    badgeBorderDark: "rgba(139, 92, 246, 0.95)",
    badgeBorderLight: "rgba(91, 33, 182, 0.75)",
    badgeTextDark: "#1e063b",
    badgeTextLight: "#2e1065",
  },
  {
    accent: "#0284c7",
    soft: "rgba(14, 165, 233, 0.32)",
    border: "rgba(56, 189, 248, 0.82)",
    glow: "rgba(14, 165, 233, 0.42)",
    badgeSoftDark: "rgba(56, 189, 248, 0.5)",
    badgeSoftLight: "rgba(186, 230, 253, 0.95)",
    badgeBorderDark: "rgba(2, 132, 199, 0.95)",
    badgeBorderLight: "rgba(3, 105, 161, 0.78)",
    badgeTextDark: "#082f49",
    badgeTextLight: "#0c4a6e",
  },
  {
    accent: "#059669",
    soft: "rgba(16, 185, 129, 0.3)",
    border: "rgba(52, 211, 153, 0.8)",
    glow: "rgba(16, 185, 129, 0.4)",
    badgeSoftDark: "rgba(52, 211, 153, 0.48)",
    badgeSoftLight: "rgba(167, 243, 208, 0.94)",
    badgeBorderDark: "rgba(5, 150, 105, 0.95)",
    badgeBorderLight: "rgba(4, 120, 87, 0.78)",
    badgeTextDark: "#022c22",
    badgeTextLight: "#064e3b",
  },
  {
    accent: "#d97706",
    soft: "rgba(245, 158, 11, 0.32)",
    border: "rgba(251, 191, 36, 0.82)",
    glow: "rgba(245, 158, 11, 0.38)",
    badgeSoftDark: "rgba(251, 191, 36, 0.52)",
    badgeSoftLight: "rgba(254, 243, 199, 0.96)",
    badgeBorderDark: "rgba(217, 119, 6, 0.95)",
    badgeBorderLight: "rgba(180, 83, 9, 0.78)",
    badgeTextDark: "#422006",
    badgeTextLight: "#78350f",
  },
  {
    accent: "#e11d48",
    soft: "rgba(244, 63, 94, 0.28)",
    border: "rgba(251, 113, 133, 0.82)",
    glow: "rgba(244, 63, 94, 0.38)",
    badgeSoftDark: "rgba(251, 113, 133, 0.5)",
    badgeSoftLight: "rgba(255, 228, 230, 0.95)",
    badgeBorderDark: "rgba(225, 29, 72, 0.92)",
    badgeBorderLight: "rgba(190, 18, 60, 0.75)",
    badgeTextDark: "#450a0f",
    badgeTextLight: "#881337",
  },
  {
    accent: "#4d7c0f",
    soft: "rgba(132, 204, 22, 0.26)",
    border: "rgba(163, 230, 53, 0.75)",
    glow: "rgba(101, 163, 13, 0.38)",
    badgeSoftDark: "rgba(163, 230, 53, 0.45)",
    badgeSoftLight: "rgba(236, 252, 203, 0.95)",
    badgeBorderDark: "rgba(77, 124, 15, 0.9)",
    badgeBorderLight: "rgba(63, 98, 18, 0.72)",
    badgeTextDark: "#1a2e05",
    badgeTextLight: "#365314",
  },
  {
    accent: "#0d9488",
    soft: "rgba(45, 212, 191, 0.28)",
    border: "rgba(45, 212, 191, 0.78)",
    glow: "rgba(13, 148, 136, 0.4)",
    badgeSoftDark: "rgba(45, 212, 191, 0.48)",
    badgeSoftLight: "rgba(204, 251, 241, 0.94)",
    badgeBorderDark: "rgba(13, 148, 136, 0.92)",
    badgeBorderLight: "rgba(15, 118, 110, 0.78)",
    badgeTextDark: "#042f2e",
    badgeTextLight: "#134e4a",
  },
  {
    accent: "#c026d3",
    soft: "rgba(217, 70, 239, 0.26)",
    border: "rgba(232, 121, 249, 0.78)",
    glow: "rgba(192, 38, 211, 0.38)",
    badgeSoftDark: "rgba(232, 121, 249, 0.48)",
    badgeSoftLight: "rgba(250, 232, 255, 0.95)",
    badgeBorderDark: "rgba(192, 38, 211, 0.9)",
    badgeBorderLight: "rgba(162, 28, 175, 0.75)",
    badgeTextDark: "#4a044e",
    badgeTextLight: "#701a75",
  },
  {
    accent: "#ea580c",
    soft: "rgba(249, 115, 22, 0.28)",
    border: "rgba(251, 146, 60, 0.8)",
    glow: "rgba(234, 88, 12, 0.36)",
    badgeSoftDark: "rgba(251, 146, 60, 0.5)",
    badgeSoftLight: "rgba(255, 237, 213, 0.96)",
    badgeBorderDark: "rgba(234, 88, 12, 0.92)",
    badgeBorderLight: "rgba(194, 65, 12, 0.78)",
    badgeTextDark: "#431407",
    badgeTextLight: "#7c2d12",
  },
  {
    accent: "#d4af37",
    soft: "rgba(212, 175, 55, 0.26)",
    border: "rgba(250, 204, 21, 0.65)",
    glow: "rgba(212, 175, 55, 0.38)",
    badgeSoftDark: "rgba(212, 175, 55, 0.42)",
    badgeSoftLight: "rgba(254, 249, 195, 0.94)",
    badgeBorderDark: "rgba(202, 138, 4, 0.88)",
    badgeBorderLight: "rgba(161, 98, 7, 0.72)",
    badgeTextDark: "#1c1410",
    badgeTextLight: "#713f12",
  },
];

export function getCategoryToneIndex(categoryId) {
  if (categoryId == null || categoryId === "") {
    return THEMES.length - 1;
  }
  const n = Number(categoryId);
  if (Number.isFinite(n) && !Number.isNaN(n)) {
    return Math.abs(Math.trunc(n)) % THEMES.length;
  }
  let h = 0;
  const s = String(categoryId);
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % THEMES.length;
}

export function getCategoryTheme(categoryId) {
  const t = THEMES[getCategoryToneIndex(categoryId)];
  return {
    accent: t.accent,
    soft: t.soft,
    border: t.border,
    glow: t.glow,
  };
}

export function getCategoryBadgeTheme(categoryId, isLightMode) {
  const t = THEMES[getCategoryToneIndex(categoryId)];
  if (isLightMode) {
    return {
      soft: t.badgeSoftLight,
      border: t.badgeBorderLight,
      badgeText: t.badgeTextLight,
      glow: t.glow,
      accent: t.accent,
    };
  }
  return {
    soft: t.badgeSoftDark,
    border: t.badgeBorderDark,
    badgeText: t.badgeTextDark,
    glow: t.glow,
    accent: t.accent,
  };
}
