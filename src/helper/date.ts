/**
 * react-datepicker mengembalikan Date yang merepresentasikan tengah malam di
 * timezone LOKAL browser (WIB, +7), bukan UTC. date.toISOString() selalu
 * konversi ke UTC dulu - untuk WIB, tengah malam tanggal X jadi jam 17:00
 * tanggal (X-1) di UTC, jadi date.toISOString().split("T")[0] mundur 1 hari
 * dari tanggal yang sebenarnya diklik user (contoh: klik tanggal 20, hasilnya
 * "19"). Fungsi ini ambil komponen tanggal lokal langsung
 * (getFullYear/getMonth/getDate), jadi selalu sama dengan tanggal yang
 * kelihatan & diklik di kalender. Pakai ini di setiap onChange DatePicker
 * yang perlu string "YYYY-MM-DD", jangan date.toISOString().split("T")[0].
 */
export const toLocalYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Kebalikan arah dari bug di atas, tapi akar masalah yang sama: dipakai buat
 * ngisi ulang <input type="datetime-local"> pas admin buka form Edit Ujian
 * (AdminCBT.tsx). exam.startAt dari backend itu string UTC (mis.
 * "2026-09-20T08:00:00.000Z" = 15:00 WIB). date.toISOString().slice(0, 16)
 * tetap ngasih jam UTC-nya ("08:00"), padahal <input type="datetime-local">
 * butuh jam LOKAL ("15:00") - beda 7 jam dari jadwal ujian yang sebenarnya.
 * Fungsi ini ambil jam dari komponen lokal (getHours/getMinutes), bukan dari
 * toISOString(), supaya form Edit nampilin jam yang sama persis dengan yang
 * diinput admin waktu bikin ujian.
 */
export const toLocalDatetimeInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
