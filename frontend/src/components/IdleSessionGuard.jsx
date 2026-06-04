import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useVaultSearchOptional } from "../contexts/VaultSearchContext";
import { clearUserSession } from "../utils/userSession";
import { IDLE_LIMIT_MS, ACTIVITY_MOUSEMOVE_THROTTLE_MS } from "../config/sessionIdle";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "click"];

export default function IdleSessionGuard() {
  const navigate = useNavigate();
  const vaultSearchCtx = useVaultSearchOptional();
  const lastActivityRef = useRef(Date.now());
  const loggingOutRef = useRef(false);
  const mouseTsRef = useRef(0);

  const bump = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const logoutForInactivity = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;

    try {
      await api.post("/logout");
    } catch {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      clearUserSession();
      vaultSearchCtx?.setQuery("");
      navigate("/login", { replace: true });
    }
  }, [navigate, vaultSearchCtx]);

  useEffect(() => {
    const onActivity = () => bump();

    ACTIVITY_EVENTS.forEach((evt) => {
      window.addEventListener(evt, onActivity, { capture: true, passive: true });
    });

    const onMove = () => {
      const now = Date.now();
      if (now - mouseTsRef.current < ACTIVITY_MOUSEMOVE_THROTTLE_MS) return;
      mouseTsRef.current = now;
      bump();
    };
    window.addEventListener("mousemove", onMove, { capture: true, passive: true });

    const tick = () => {
      if (loggingOutRef.current) return;
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= IDLE_LIMIT_MS) {
        void logoutForInactivity();
      }
    };

    const id = window.setInterval(tick, 5000);

    return () => {
      window.clearInterval(id);
      ACTIVITY_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, onActivity, true);
      });
      window.removeEventListener("mousemove", onMove, true);
    };
  }, [bump, logoutForInactivity]);

  return null;
}
