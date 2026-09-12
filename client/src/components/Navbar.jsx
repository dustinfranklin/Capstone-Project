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
    <nav className="navbar navbar-expand-md navbar-dark site-navbar">
      <div className="container">
        <Link className="navbar-brand site-brand" to="/">
          Christin Nolantino
        </Link>

        {/* Hamburger button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible navigation */}
        <div
          className="collapse navbar-collapse"
          id="mainNavbar"
        >
          <ul className="navbar-nav ms-auto align-items-md-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>

            {currentUser ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text nav-welcome">
                    Welcome, {currentUser.username}!
                  </span>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-logout"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/login"
                  >
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            {/* Theme toggle is always last */}
            <li className="nav-item theme-toggle-nav-item">
              <button
                className={`movie-theme-toggle ${theme}`}
                onClick={toggleTheme}
                type="button"
                aria-label={`Switch to ${
                  theme === "light"
                    ? "dark"
                    : "light"
                } mode`}
                title={`Switch to ${
                  theme === "light"
                    ? "dark"
                    : "light"
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
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;