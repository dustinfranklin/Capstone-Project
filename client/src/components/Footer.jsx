import footIcon from "../images/foot-icon.png";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container text-center">
        <p className="mb-0 footer-copyright">
          © 2026 Christin Nolantino
          <img
            src={footIcon}
            alt=""
            className="footer-foot-icon"
          />
        </p>
      </div>
    </footer>
  );
}

export default Footer;