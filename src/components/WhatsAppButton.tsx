import WhatsAppIcon from "./icon/WhatsAppIcon";

type Props = {
  phone?: string | null;
};

export default function WhatsAppButton({ phone }: Props) {
  if (!phone) return null;

  const message = "Halo panitia, saya ingin bertanya tentang lomba.";

  let cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.substring(1);
  }

  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label="Hubungi Panitia via WhatsApp"
    >
      <WhatsAppIcon size={26} color="white" />
    </a>
  );
}
