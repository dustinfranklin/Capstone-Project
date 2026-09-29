import { useState } from "react";
import { Link } from "react-router-dom";

import popcornIcon from "../images/popcorn-toggle.png";
import seatIcon from "../images/seat-toggle.png";

function Navbar({
  currentUser,
  setCurrentUser,
  theme,
  toggleTheme,
}) {
  const [claudeQuestion, setClaudeQuestion] = useState("");
  const [claudeAnswer, setClaudeAnswer] = useState("");
  const [claudeError, setClaudeError] = useState("");
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [showClaudeResult, setShowClaudeResult] = useState(false);

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  async function handleClaudeSubmit(event) {
    event.preventDefault();

    const question = claudeQuestion.trim();

    if (!question) {
      setClaudeAnswer("");
      setClaudeError("Please enter a movie question.");
      setShowClaudeResult(true);
      return;
    }

    setClaudeLoading(true);
    setClaudeAnswer("");
    setClaudeError("");
    setShowClaudeResult(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/claude",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Claude could not answer your question."
        );
      }

      setClaudeAnswer(
        data.answer ||
          "Claude did not return an answer."
      );
    } catch (error) {
      console.error(
        "Claude search error:",
        error
      );

      setClaudeError(
        error.message ||
          "Claude could not answer your question."
      );
    } finally {
      setClaudeLoading(false);
    }
  }

  function handleClaudeClose() {
    setShowClaudeResult(false);
    setClaudeAnswer("");
    setClaudeError("");
  }

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-dark site-navbar">
        <div className="container">
          <Link
            className="navbar-brand site-brand"
            to="/"
          >
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
                <Link
                  className="nav-link"
                  to="/"
                >
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="/about"
                >
                  About
                </Link>
              </li>

              {currentUser ? (
                <>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to="/watchlist"
                    >
                      My Watchlist
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to="/profile"
                    >
                      My Profile
                    </Link>
                  </li>

                  <li className="nav-item">
                    <span className="navbar-text nav-welcome">
                      Welcome,{" "}
                      {currentUser.username}!
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

      {/* Claude AI Search */}
      <div className="claude-navbar-area">
        <div className="container">
          <form
            className="claude-navbar-form"
            onSubmit={handleClaudeSubmit}
          >
            <span className="claude-navbar-label">
              Ask Claude
            </span>

            <input
              type="text"
              className="form-control claude-navbar-input"
              placeholder="Ask about Nolan and Tarantino movies..."
              value={claudeQuestion}
              onChange={(event) =>
                setClaudeQuestion(event.target.value)
              }
              maxLength={500}
              aria-label="Ask Claude a movie question"
            />

            <button
              className="btn claude-navbar-button"
              type="submit"
              disabled={claudeLoading}
            >
              {claudeLoading
                ? "Thinking..."
                : "Ask"}
            </button>
          </form>

          {showClaudeResult && (
            <div className="claude-result-panel">
              <div className="claude-result-header">
                <strong>
                  Claude Movie Assistant
                </strong>

                <button
                  type="button"
                  className="claude-result-close"
                  onClick={handleClaudeClose}
                  aria-label="Close Claude response"
                >
                  ×
                </button>
              </div>

              <div className="claude-result-body">
                {claudeLoading && (
                  <p className="mb-0">
                    Claude is thinking...
                  </p>
                )}

                {!claudeLoading &&
                  claudeAnswer && (
                    <p className="mb-0">
                      {claudeAnswer}
                    </p>
                  )}

                {!claudeLoading &&
                  claudeError && (
                    <p className="mb-0 claude-result-error">
                      {claudeError}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;