export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">LombaPelajar.id</div>
        <div className="footer-copy">© {new Date().getFullYear()} Platform Lomba Pelajar</div>
      </div>
    </footer>
  );
}
