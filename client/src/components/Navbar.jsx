import { Link } from "react-router-dom";
import popcornIcon from "../images/popcorn-toggle.png";
import seatIcon from "../images/seat-toggle.png";

function Navbar({
  currentUser,
  setCurrentUser,
  theme,
  toggleTheme,
}) {
  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  return (
    <nav className="navbar navbar-expand-lg site-navbar">
      <div className="container">
        <Link
          className="navbar-brand site-brand"
          to="/"
        >
          Christin Nolantino
        </Link>

        <div className="navbar-nav ms-auto align-items-lg-center">
          <Link className="nav-link" to="/">
            Home
          </Link>
          <Link className="nav-link" to="/about">
            About
          </Link>

          {currentUser ? (
            <>
              <span className="navbar-text me-3">
                Welcome, {currentUser.username}!
              </span>

              <button
                className={`movie-theme-toggle ${theme}`}
                onClick={toggleTheme}
                type="button"
                aria-label={`Switch to ${
                  theme === "light" ? "dark" : "light"
                } mode`}
                title={`Switch to ${
                  theme === "light" ? "dark" : "light"
                } mode`}
              >
                <span className="theme-toggle-track">
                  <span className="theme-toggle-icon">
                    <img
                      src={
                        theme === "light"
                          ? popcornIcon
                          : seatIcon
                      }
                      alt=""
                    />
                  </span>
                </span>
              </button>

              <button
                className="btn btn-logout ms-2"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>

              <Link
                className="nav-link me-2"
                to="/register"
              >
                Register
              </Link>

              <button
                className={`movie-theme-toggle ${theme}`}
                onClick={toggleTheme}
                type="button"
                aria-label={`Switch to ${
                  theme === "light" ? "dark" : "light"
                } mode`}
                title={`Switch to ${
                  theme === "light" ? "dark" : "light"
                } mode`}
              >
                <span className="theme-toggle-track">
                  <span className="theme-toggle-icon">
                    <img
                      src={
                        theme === "light"
                          ? popcornIcon
                          : seatIcon
                      }
                      alt=""
                    />
                  </span>
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;