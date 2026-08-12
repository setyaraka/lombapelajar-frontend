import { useEffect, useState } from "react";

// Anti-cheating (deteksi tab-switch/window-blur + peringatan ke peserta +
// catat pelanggaran ke server) sengaja DILEPAS di sini sesuai kesepakatan
// client (chat 2-3 Juli: "gak perlu anti cheating dulu ... biar gak terlalu
// mahal"). Backend (ViolationLog, ExamActivityEvent.TAB_SWITCH/WINDOW_BLUR/
// WINDOW_FOCUS, kolom "Pelanggaran" di monitoring & export) sengaja TIDAK
// disentuh — begitu tidak ada lagi event yang dikirim dari sini, semua itu
// otomatis selalu kosong/0. Kalau nanti fitur ini mau diaktifkan lagi, lihat
// git history file ini (sebelum komit ini) untuk logika lengkapnya.
//
// Yang dipertahankan: deteksi online/offline murni untuk UX koneksi terputus
// ("Koneksi terputus. Jawaban akan dikirim kembali saat koneksi tersedia." —
// lihat ExamPage.tsx) — ini bukan bagian dari anti-cheating, jadi tetap ada.
export function useExamGuard() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return { online };
}
