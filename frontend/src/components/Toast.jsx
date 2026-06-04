export default function Toast({ message, visible, type = "success" }) {
  if (!message) return null;

  return (
    <div
      className={`toast-notification ${visible ? "visible" : ""} toast-${type}`}
      role="status"
    >
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
}
