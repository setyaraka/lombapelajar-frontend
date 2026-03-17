import { useCallback, useEffect, useState } from "react";
import {
  createCompetition,
  getCompetition,
  updateCompetition,
} from "../../services/competition.service";

type Props = {
  open: boolean;
  onClose: () => void;
  competitionId?: string | null;
  onSuccess?: () => void;
};

export default function CreateCompetitionModal({ open, onClose, competitionId, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [deadline, setDeadline] = useState("");
  const [price, setPrice] = useState("");
  const [poster, setPoster] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const [requirements, setRequirements] = useState<string[]>([""]);
  const [timeline, setTimeline] = useState([{ title: "", startDate: "", endDate: "" }]);

  const [bankName, setBankName] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [bankHolder, setBankHolder] = useState("");

  const addRequirement = () => setRequirements([...requirements, ""]);
  const removeRequirement = (i: number) =>
    setRequirements(requirements.filter((_, idx) => idx !== i));

  const addTimeline = () => setTimeline([...timeline, { title: "", startDate: "", endDate: "" }]);
  const removeTimeline = (i: number) => setTimeline(timeline.filter((_, idx) => idx !== i));

  const formatRupiah = (value: string) => {
    if (!value) return "";

    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "");
    setPrice(raw);
  };

  const resetForm = useCallback(() => {
    setTitle("");
    setCategory("");
    setLevel("");
    setDeadline("");
    setPrice("");
    setPoster(null);
    setDescription("");

    setBankName("");
    setBankNumber("");
    setBankHolder("");

    setRequirements([""]);
    setTimeline([{ title: "", startDate: "", endDate: "" }]);
  }, []);

  const submit = async () => {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("level", level);
    formData.append("deadline", deadline);
    formData.append("price", price);
    formData.append("description", description);

    formData.append("bankName", bankName);
    formData.append("bankNumber", bankNumber);
    formData.append("bankHolder", bankHolder);

    if (poster) {
      formData.append("poster", poster);
    }

    formData.append("requirements", JSON.stringify(requirements));
    formData.append("timeline", JSON.stringify(timeline));

    try {
      if (competitionId) {
        await updateCompetition(competitionId, formData);
        alert("Lomba berhasil diupdate!");
      } else {
        await createCompetition(formData);
        alert("Lomba berhasil dibuat!");
      }

      onSuccess?.();
      onClose();
      resetForm();
    } catch {
      alert("Gagal menyimpan lomba");
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!open || !competitionId) return;

    const load = async () => {
      const data = await getCompetition(competitionId);

      setTitle(data.title);
      setCategory(data.category);
      setLevel(data.level);
      setDeadline(data.deadline.slice(0, 10));
      setPrice(String(data.price));
      setPoster(null);
      setDescription(data.description || "");

      setRequirements(data.requirements?.map((r) => r.text) || [""]);

      setTimeline(
        data.timelines?.map((t) => ({
          title: t.title,
          startDate: t.startDate.slice(0, 10),
          endDate: t.endDate.slice(0, 10),
        })) || [{ title: "", startDate: "", endDate: "" }]
      );

      setBankName(data.bankName || "");
      setBankNumber(data.bankNumber || "");
      setBankHolder(data.bankHolder || "");
    };

    load();
  }, [open, competitionId]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div
          className="modal-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <h2>{competitionId ? "Edit Lomba" : "Tambah Lomba"}</h2>
          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <input
              placeholder="Nama Lomba"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Kategori</option>
              <option value="akademi">Akademik</option>
              <option value="bahasa">Bahasa</option>
              <option value="sains">Sains</option>
            </select>

            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">Jenjang</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
              <option value="sma">SMA</option>
            </select>

            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <input
              placeholder="Harga (Rp)"
              value={formatRupiah(price)}
              onChange={handlePriceChange}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPoster(file);
              }}
            />
            {poster && (
              <>
                <img src={URL.createObjectURL(poster)} style={{ width: 500 }} />
                <br />
              </>
            )}
            <input
              placeholder="Nama Bank (contoh: BCA)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="full"
            />

            <input
              placeholder="Nomor Rekening"
              value={bankNumber}
              onChange={(e) => setBankNumber(e.target.value)}
            />

            <input
              placeholder="Atas Nama Rekening"
              value={bankHolder}
              onChange={(e) => setBankHolder(e.target.value)}
            />
          </div>

          <textarea
            placeholder="Deskripsi lomba..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="full"
          />

          <div className="section-title">Persyaratan</div>
          {requirements.map((r, i) => (
            <div key={i} className="dynamic-row">
              <input
                value={r}
                onChange={(e) => {
                  const copy = [...requirements];
                  copy[i] = e.target.value;
                  setRequirements(copy);
                }}
              />
              <button onClick={() => removeRequirement(i)}>✕</button>
            </div>
          ))}
          <div className="add-row">
            <button className="btn-add" onClick={addRequirement}>
              + Tambah Syarat
            </button>
          </div>

          {/* TIMELINE STEPPER */}
          <div className="section-title">Timeline</div>
          {timeline.map((t, i) => (
            <div key={i} className="dynamic-row">
              <input
                placeholder="Nama Tahap"
                value={t.title}
                onChange={(e) => {
                  const copy = [...timeline];
                  copy[i].title = e.target.value;
                  setTimeline(copy);
                }}
              />

              <input
                type="date"
                value={t.startDate}
                onChange={(e) => {
                  const copy = [...timeline];
                  copy[i].startDate = e.target.value;
                  setTimeline(copy);
                }}
              />

              <input
                type="date"
                value={t.endDate}
                onChange={(e) => {
                  const copy = [...timeline];
                  copy[i].endDate = e.target.value;
                  setTimeline(copy);
                }}
              />

              <button onClick={() => removeTimeline(i)}>✕</button>
            </div>
          ))}
          <div className="add-row">
            <button className="btn-add" onClick={addTimeline}>
              + Tambah Tahap
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={handleClose}>
            Batal
          </button>
          <button className="btn primary" onClick={submit}>
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
