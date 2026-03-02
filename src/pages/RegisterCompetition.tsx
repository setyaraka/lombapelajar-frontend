import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Stepper from "../components/Stepper";
import ParticipantForm from "../components/ParticipantForm";
import PaymentForm from "../components/PaymentForm";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createRegistration } from "../services/registration.service";
import { uploadPaymentProof } from "../services/payment.service";
import { getCompetition } from "../services/competition.service";

export type RegisterForm = {
  name: string;
  nisn: string;
  school: string;
  level: string;
  whatsapp: string;
  address: string;
  paymentProof?: File | null;
};

type CompetitionPaymentInfo = {
  id: string;
  title: string;
  price: number;
  bankName?: string | null;
  bankNumber?: string | null;
  bankHolder?: string | null;
};

export default function RegisterCompetition() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [competition, setCompetition] = useState<CompetitionPaymentInfo | null>(null);

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    nisn: "",
    school: "",
    level: "",
    whatsapp: "",
    address: "",
    paymentProof: null,
  });

  const updateForm = (data: Partial<RegisterForm>) => setForm((prev) => ({ ...prev, ...data }));

  // LOAD COMPETITION DETAIL
  console.log(id, ">>>> ID");
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const c = await getCompetition(id);

        setCompetition({
          id: c.id,
          title: c.title,
          price: c.price,
          bankName: c.bankName,
          bankNumber: c.bankNumber,
          bankHolder: c.bankHolder,
        });
      } catch {
        alert("Lomba tidak ditemukan");
        navigate("/");
      }
    };

    load();
  }, [id, navigate]);

  // SUBMIT FLOW
  const submit = async () => {
    if (!id || !competition) return;

    if (!form.paymentProof) {
      alert("Silakan upload bukti pembayaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      // STEP 1 — create registration
      const reg = await createRegistration(id, {
        nisn: form.nisn,
        school: form.school,
        phone: form.whatsapp,
        address: form.address,
      });

      // STEP 2 — upload payment proof
      await uploadPaymentProof(reg.id, form.paymentProof);

      alert("Pendaftaran berhasil!");
      navigate("/list");
    } catch {
      alert("Terjadi kesalahan saat mengirim pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-page">
      <Header />

      <div className="container">
        {/* HEADER INFO */}
        <div className="card event-card">
          <div className="event-info">
            <h2>{competition?.title ?? "Memuat lomba..."}</h2>
            <div className="event-meta">
              <span className="badge">Peserta</span>
              <span>Lengkapi data dengan benar</span>
            </div>
          </div>

          <div className="deadline">
            <small>Status</small>
            <b>{loading ? "Memproses..." : "Belum dikirim"}</b>
          </div>
        </div>

        {/* STEP INFO */}
        <div className="register-status">
          Langkah {step} dari 2 • {step === 1 ? "Isi Data Peserta" : "Upload Pembayaran"}
        </div>

        <Stepper step={step} />

        {/* STEP 1 */}
        {step === 1 && (
          <ParticipantForm form={form} updateForm={updateForm} next={() => setStep(2)} />
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <PaymentForm
            form={form}
            competition={competition}
            updateForm={updateForm}
            back={() => setStep(1)}
            submit={submit}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
