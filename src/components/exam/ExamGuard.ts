import { useEffect, useState } from "react";
import { ExamAPI } from "../../services/exam.service";

export function useExamGuard(attemptId: string) {
  const [warning, setWarning] = useState("");
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const log = (
      event: "TAB_SWITCH" | "WINDOW_BLUR" | "WINDOW_FOCUS",
      metadata?: Record<string, unknown>
    ) => {
      void ExamAPI.logActivity(attemptId, event, metadata).catch(() => undefined);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        setWarning("Anda terdeteksi keluar dari tab ujian. Aktivitas ini dicatat oleh sistem.");
        log("TAB_SWITCH", { visibilityState: document.visibilityState });
      }
    };

    const onBlur = () => {
      setWarning("Jendela ujian tidak aktif. Silakan kembali fokus mengerjakan ujian.");
      log("WINDOW_BLUR");
    };

    const onFocus = () => {
      log("WINDOW_FOCUS");
    };

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [attemptId]);

  return {
    warning,
    online,
    clearWarning: () => setWarning(""),
  };
}
