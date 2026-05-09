import WhatsAppIcon from "./icon/WhatsAppIcon";

export default function WhatsAppButton() {
  const phone = "6281234567890";
  const message = "Halo panitia, saya ingin bertanya tentang lomba.";

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
    >
      <WhatsAppIcon size={26} color="white" />
    </a>
  );
}
