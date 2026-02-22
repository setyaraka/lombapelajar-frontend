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
};

export default function CreateCompetitionModal({ open, onClose, competitionId }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [deadline, setDeadline] = useState("");
  const [price, setPrice] = useState("");
  const [poster, setPoster] = useState("");
  const [description, setDescription] = useState("");

  const [requirements, setRequirements] = useState<string[]>([""]);
  const [timeline, setTimeline] = useState([{ title: "", startDate: "", endDate: "" }]);

  const addRequirement = () => setRequirements([...requirements, ""]);
  const removeRequirement = (i: number) =>
    setRequirements(requirements.filter((_, idx) => idx !== i));

  const addTimeline = () => setTimeline([...timeline, { title: "", startDate: "", endDate: "" }]);
  const removeTimeline = (i: number) => setTimeline(timeline.filter((_, idx) => idx !== i));

  const submit = async () => {
    const payload = {
      title,
      category,
      level,
      deadline,
      price,
      poster,
      description,
      requirements: requirements.filter((r) => r.trim() !== ""),
      timeline: timeline.filter((t) => t.title && t.startDate && t.endDate),
    };

    try {
      if (competitionId) {
        await updateCompetition(competitionId, payload);
        alert("Lomba berhasil diupdate!");
      } else {
        await createCompetition(payload);
        alert("Lomba berhasil dibuat!");
      }

      onClose();
    } catch {
      alert("Gagal menyimpan lomba");
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    setTitle("");
    setCategory("");
    setLevel("");
    setDeadline("");
    setPrice("");
    setPoster("");
    setDescription("");
    setRequirements([""]);
    setTimeline([{ title: "", startDate: "", endDate: "" }]);
  }, [onClose]);

  useEffect(() => {
    if (!open || !competitionId) return;

    const load = async () => {
      const data = await getCompetition(competitionId);

      setTitle(data.title);
      setCategory(data.category);
      setLevel(data.level);
      setDeadline(data.deadline.slice(0, 10));
      setPrice(String(data.price));
      setPoster(data.poster || "");
      setDescription(data.description || "");

      setRequirements(data.requirements?.map((r) => r.text) || [""]);

      setTimeline(
        data.timelines?.map((t) => ({
          title: t.title,
          startDate: t.startDate.slice(0, 10),
          endDate: t.endDate.slice(0, 10),
        })) || [{ title: "", startDate: "", endDate: "" }]
      );
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
        <h2>Tambah Lomba</h2>

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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            placeholder="URL Poster"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
          />
        </div>

        <textarea
          placeholder="Deskripsi lomba..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <h3>Persyaratan</h3>
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
        <button onClick={addRequirement}>+ Tambah Syarat</button>

        {/* TIMELINE STEPPER */}
        <h3>Timeline</h3>
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
        <button onClick={addTimeline}>+ Tambah Tahap</button>

        <div className="modal-actions">
          <button className="btn" onClick={handleClose}>
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
