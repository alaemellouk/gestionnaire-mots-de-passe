export default function PassGuardLogo({ as: Tag = "div", variant = "sidebar", className = "" }) {
  return (
    <Tag className={`passguard-logo passguard-logo--${variant} ${className}`.trim()}>
      <span className="passguard-logo__text">PassGuard</span>
    </Tag>
  );
}
