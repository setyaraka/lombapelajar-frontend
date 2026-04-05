export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">Maestro.id</div>
        <div className="footer-copy">© {new Date().getFullYear()} Platform Maestro</div>
      </div>
    </footer>
  );
}
