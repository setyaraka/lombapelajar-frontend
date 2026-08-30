import { useState, useEffect, useRef } from "react";

// Dropdown generik bergaya sama dengan dropdown ujian di Bank Soal/Monitoring
// (klik untuk buka, ada pencarian, list bisa di-scroll, tertutup otomatis
// kalau diklik di luar) - dipakai buat ganti <select> bawaan browser di
// berbagai form/filter admin CBT supaya tampilannya konsisten satu sama
// lain, bukan lebar-melebar kena style global "select { width: 100% }".
export default function SearchableDropdown({
  options,
  value,
  onChange,
  allLabel,
  searchPlaceholder = "Cari...",
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Klik di luar area dropdown (trigger + panel) menutupnya.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const triggerLabel = selected ? selected.label : allLabel;

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={containerRef} style={{ position: "relative", zIndex: open ? 40 : 1 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "0.55rem 0.9rem",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "0.85rem",
          fontWeight: 600,
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          minWidth: "200px",
          justifyContent: "space-between",
          color: "#0f172a",
        }}
      >
        <span>{triggerLabel}</span>
        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>▼</span>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            minWidth: "240px",
            backgroundColor: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            marginTop: "4px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "0.75rem",
          }}
        >
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            <div
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: value === "" ? "#f1f5f9" : "transparent",
              }}
            >
              {allLabel}
            </div>
            {filtered.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  backgroundColor: value === option.value ? "#f1f5f9" : "transparent",
                }}
              >
                {option.label}
              </div>
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                Tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
