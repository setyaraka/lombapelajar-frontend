import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Stepper from "../components/Stepper";
import ParticipantForm from "../components/ParticipantForm";
import PaymentForm from "../components/PaymentForm";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createRegistration } from "../services/registration.service";
import { uploadPaymentProof } from "../services/payment.service";

export type RegisterForm = {
  name: string;
  nisn: string;
  school: string;
  level: string;
  whatsapp: string;
  address: string;
  paymentProof?: File | null;
};

export default function RegisterCompetition() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const submit = async () => {
    if (!id) return;
    // VALIDASI FRONTEND DULU
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
        <div className="card event-card">
          <div className="event-info">
            <h2>Pendaftaran Kompetisi</h2>
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

        <div className="register-status">
          Langkah {step} dari 2 • {step === 1 ? "Isi Data Peserta" : "Upload Pembayaran"}
        </div>

        <Stepper step={step} />

        {step === 1 && (
          <ParticipantForm form={form} updateForm={updateForm} next={() => setStep(2)} />
        )}

        {step === 2 && (
          <PaymentForm
            form={form}
            updateForm={updateForm}
            back={() => setStep(1)}
            submit={submit}
            // loading={loading}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
