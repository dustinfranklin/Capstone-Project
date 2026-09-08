import { Link } from "react-router-dom";

function Navbar({ currentUser, setCurrentUser }) {
  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Christin Nolantino
        </Link>

        <div className="navbar-nav ms-auto">
          <Link className="nav-link" to="/">
            Home
          </Link>

          {currentUser ? (
            <>
              <span className="navbar-text me-3">
                Welcome, {currentUser.username}
              </span>

              <button
                className="btn btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>

              <Link className="nav-link" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;