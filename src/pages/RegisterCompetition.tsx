import { useState } from "react";
import Stepper from "../components/Stepper";
import ParticipantForm from "../components/ParticipantForm";
import PaymentForm from "../components/PaymentForm";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
  const [step, setStep] = useState(1);
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

  const submit = () => {
    alert("Pendaftaran berhasil!");
    console.log(form);
  };

  return (
    <div className="layout-page">
      <Header />

      <div className="container">
        {/* Event Header */}
        <div className="card event-card">
          <div className="event-info">
            <h2>Olimpiade Matematika Nasional</h2>
            <div className="event-meta">
              <span className="badge">SMA</span>
              <span>Nasional • Online Competition</span>
            </div>
          </div>

          <div className="deadline">
            <small>Deadline Pendaftaran</small>
            <b>30 Maret 2026</b>
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
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
