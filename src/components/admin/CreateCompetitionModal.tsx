import { useCallback, useEffect, useState } from "react";
import {
  createCompetition,
  getCompetition,
  updateCompetition,
} from "../../services/competition.service";
import imageCompression from "browser-image-compression";
import LoadingButton from "../LoadingButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  competitionId?: string | null;
  onSuccess?: () => void;
};

export default function CreateCompetitionModal({ open, onClose, competitionId, onSuccess }: Props) {
  const defaultPoster = "/default-poster.png";
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [requirements, setRequirements] = useState<string[]>([""]);
  const [timeline, setTimeline] = useState([{ title: "", startDate: "", endDate: "" }]);

  const [bankName, setBankName] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [bankHolder, setBankHolder] = useState("");

  const [poster, setPoster] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<string[]>(["BANK"]);
  const [qris, setQris] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

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
    setLevels([]);
    setDeadline("");
    setPrice("");
    setPoster(null);
    setDescription("");

    setBankName("");
    setBankNumber("");
    setBankHolder("");

    setPaymentMethods(["BANK"]);
    setQris(null);
    setQrisPreview(null);
    setQrisUrl(null);

    setRequirements([""]);
    setTimeline([{ title: "", startDate: "", endDate: "" }]);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      setPoster(compressedFile);

      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);

      e.target.value = "";
    } catch {
      toast.error("Gagal memproses gambar");
    }
  };

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      setQris(compressedFile);

      const previewUrl = URL.createObjectURL(compressedFile);
      setQrisPreview(previewUrl);

      e.target.value = "";
    } catch {
      toast.error("Gagal memproses QRIS");
    }
  };

  const submit = async () => {
    const formData = new FormData();

    if (levels.length === 0) return toast.error("Pilih minimal satu jenjang!");
    if (paymentMethods.length === 0) return toast.error("Pilih minimal satu metode pembayaran!");

    if (paymentMethods.includes("BANK")) {
      if (!bankName || !bankNumber || !bankHolder) {
        return toast.error("Lengkapi data rekening bank!");
      }
    }

    if (paymentMethods.includes("QRIS")) {
      if (!qris && !qrisUrl) {
        return toast.error("Upload file QRIS!");
      }
    }

    formData.append("title", title);
    formData.append("category", category);
    formData.append("level", JSON.stringify(levels));
    formData.append("deadline", deadline);
    formData.append("price", price);
    formData.append("description", description);

    if (paymentMethods.includes("BANK")) {
      formData.append("bankName", bankName);
      formData.append("bankNumber", bankNumber);
      formData.append("bankHolder", bankHolder);
    } else {
      formData.append("bankName", "");
      formData.append("bankNumber", "");
      formData.append("bankHolder", "");
    }

    if (poster) {
      formData.append("poster", poster);
    } else if (posterUrl) {
      formData.append("poster", posterUrl);
    }

    if (paymentMethods.includes("QRIS")) {
      if (qris) {
        formData.append("qris", qris);
      } else if (qrisUrl) {
        formData.append("qris", qrisUrl);
      }
    } else {
      formData.append("qris", "");
    }

    formData.append("requirements", JSON.stringify(requirements));
    formData.append("timeline", JSON.stringify(timeline));

    setLoading(true);
    try {
      if (competitionId) {
        await updateCompetition(competitionId, formData);
        toast.success("Lomba berhasil diupdate!");
      } else {
        await createCompetition(formData);
        toast.success("Lomba berhasil dibuat!");
      }

      onSuccess?.();
      onClose();
      resetForm();
      setPosterUrl(null);
    } catch {
      toast.error("Gagal menyimpan lomba");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    resetForm();
    setPosterUrl(null);
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!open || !competitionId) return;

    const load = async () => {
      const data = await getCompetition(competitionId);

      setTitle(data.title);
      setCategory(data.category);
      setLevels(Array.isArray(data.level) ? data.level : [data.level]);
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
      setQrisUrl(data.qris || null);

      const methods = [];
      if (data.bankName) methods.push("BANK");
      if (data.qris) methods.push("QRIS");
      setPaymentMethods(methods.length > 0 ? methods : ["BANK"]);

      setPoster(null);
      setPosterUrl(data.poster);
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

            <div className="checkbox-group-wrapper full">
              <label>Jenjang</label>
              <div className="checkbox-group">
                {["SD", "SMP", "SMA", "MAHASISWA"].map((lv) => (
                  <label key={lv} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={levels.includes(lv)}
                      onChange={(e) => {
                        if (e.target.checked) setLevels([...levels, lv]);
                        else setLevels(levels.filter((l) => l !== lv));
                      }}
                    />
                    <span>{lv}</span>
                  </label>
                ))}
              </div>
            </div>

            <DatePicker
              selected={deadline ? new Date(deadline) : null}
              onChange={(date: Date | null) =>
                setDeadline(date ? date.toISOString().split("T")[0] : "")
              }
              locale={id}
              dateFormat="dd/MM/yyyy"
              placeholderText="Deadline Lomba"
              className="datepicker-input"
            />
            <input
              placeholder="Harga (Rp)"
              value={formatRupiah(price)}
              onChange={handlePriceChange}
            />
            <div className="upload-field">
              <input type="file" accept="image/*" onChange={handleUpload} />
              <small style={{ fontSize: 11, color: "#777", display: "block", marginTop: 4 }}>
                Format JPG/PNG
              </small>
            </div>
            {(preview || posterUrl) && (
              <>
                <img
                  src={
                    preview
                      ? preview
                      : posterUrl
                        ? `${import.meta.env.VITE_API_URL}/files/${posterUrl}`
                        : defaultPoster
                  }
                  alt={title}
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = defaultPoster)}
                  style={{ width: 500 }}
                />
                <br />
              </>
            )}
            <div className="checkbox-group-wrapper full">
              <label>Metode Pembayaran (Pilih minimal satu)</label>
              <div className="checkbox-group">
                {["BANK", "QRIS"].map((m) => (
                  <label key={m} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={paymentMethods.includes(m)}
                      onChange={() => {
                        if (paymentMethods.includes(m)) {
                          if (paymentMethods.length > 1) {
                            setPaymentMethods(paymentMethods.filter((item) => item !== m));
                          } else {
                            toast.error("Minimal pilih satu metode pembayaran");
                          }
                        } else {
                          setPaymentMethods([...paymentMethods, m]);
                        }
                      }}
                    />
                    <span>{m === "BANK" ? "Transfer Bank" : "QRIS"}</span>
                  </label>
                ))}
              </div>
            </div>

            {paymentMethods.includes("BANK") && (
              <>
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
              </>
            )}

            {paymentMethods.includes("QRIS") && (
              <div className="full">
                <div className="upload-field">
                  <label style={{ fontSize: 13, color: "#64748b", marginBottom: 8, display: "block" }}>
                    Upload QRIS
                  </label>
                  <input type="file" accept="image/*" onChange={handleQrisUpload} />
                </div>
                {(qrisPreview || qrisUrl) && (
                  <img
                    src={
                      qrisPreview
                        ? qrisPreview
                        : `${import.meta.env.VITE_API_URL}/files/${qrisUrl}`
                    }
                    alt="QRIS"
                    style={{ maxWidth: "200px", marginTop: 10, borderRadius: 8 }}
                  />
                )}
              </div>
            )}
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

              <DatePicker
                selectsRange={true}
                startDate={t.startDate ? new Date(t.startDate) : undefined}
                endDate={t.endDate ? new Date(t.endDate) : undefined}
                onChange={(update: [Date | null, Date | null]) => {
                  const [start, end] = update;
                  const copy = [...timeline];
                  copy[i].startDate = start ? start.toISOString().split("T")[0] : "";
                  copy[i].endDate = end ? end.toISOString().split("T")[0] : "";
                  setTimeline(copy);
                }}
                locale={id}
                dateFormat="dd/MM/yyyy"
                placeholderText="Pilih rentang tanggal"
                className="datepicker-input"
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
          <LoadingButton loading={loading} className="btn approve" onClick={submit}>
            Simpan
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
