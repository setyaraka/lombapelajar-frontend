import { useEffect, useState } from "react";

type Props = {
  serverTime: string;
  expiredAt: string;
  onExpire: () => void;
};

export default function ExamTimer({ serverTime, expiredAt, onExpire }: Props) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const offsetMs = Date.now() - new Date(serverTime).getTime();
    const tick = () => {
      const next = Math.max(0, new Date(expiredAt).getTime() - (Date.now() - offsetMs));
      setRemainingMs(next);
      if (next === 0) onExpire();
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [expiredAt, onExpire, serverTime]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const danger = remainingMs <= 5 * 60 * 1000;

  return (
    <div className={`exam-timer ${danger ? "danger" : ""}`} aria-live="polite">
      <span>Waktu</span>
      <strong>
        {[hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":")}
      </strong>
    </div>
  );
}
