export default function Stepper({ step }: { step: number }) {
  return (
    <div className="stepper">
      <div className={`step ${step === 1 ? "active" : ""}`}>
        <div className="circle">1</div>
        <span>Data Peserta</span>
      </div>

      <div className="line"></div>

      <div className={`step ${step === 2 ? "active" : ""}`}>
        <div className="circle">2</div>
        <span>Pembayaran</span>
      </div>
    </div>
  );
}
