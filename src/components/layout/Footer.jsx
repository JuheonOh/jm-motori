export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <a className="footer-wordmark" href="#home" aria-label="JM MOTORI 맨 위로">JM MOTORI<span aria-hidden="true">.</span></a>
        <p>광주 광산구 우산동</p>
        <p>© {new Date().getFullYear()} JM MOTORI</p>
      </div>
    </footer>
  );
}
