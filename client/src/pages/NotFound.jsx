import { Link } from "react-router-dom";

function NotFound({ currentUser }) {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-code">
          404
        </div>

        <h1 className="cinematic-heading not-found-title">
          Scene Not Found
        </h1>

        <p className="not-found-message">
          Looks like this page
          ended up on the
          cutting-room floor.
        </p>

        <p className="not-found-submessage">
          The reel may be lost,
          the scene may have
          been deleted, or you
          may have followed the
          wrong link.
        </p>

        <div className="not-found-divider">
          ✦
        </div>

        <div className="not-found-actions">
          <Link
            to="/"
            className="btn btn-primary"
          >
            Back to Filmography
          </Link>

          {currentUser && (
            <Link
              to="/watchlist"
              className="btn btn-outline-primary"
            >
              My Watchlist
            </Link>
          )}
        </div>

        <div className="not-found-credit">
          A Christin Nolantino
          Production
        </div>
      </div>
    </div>
  );
}

export default NotFound;