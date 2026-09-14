import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import MovieLoader
  from "../components/MovieLoader";

import DirectorQuote
  from "../components/DirectorQuote";

function Watchlist({
  currentUser,
}) {
  const [
    movies,
    setMovies,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    async function getWatchlist() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `http://localhost:4000/api/users/${currentUser.id}/favorites`
          );

        const data =
          await response.json();

        if (response.ok) {
          setMovies(data);
        } else {
          setError(
            data.message ||
              "Could not load your watchlist."
          );
        }
      } catch (error) {
        console.error(
          "Watchlist fetch error:",
          error
        );

        setError(
          "Could not connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    getWatchlist();
  }, [currentUser]);

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!currentUser) {
    return (
      <div className="watchlist-page">
        <header className="watchlist-hero text-center">
          <span className="watchlist-eyebrow">
            Your Personal Collection
          </span>

          <h1 className="cinematic-heading">
            My Watchlist
          </h1>
        </header>

        <div className="watchlist-login-card">
          <h3>
            Log In to View Your Watchlist
          </h3>

          <p>
            Save movies you want
            to revisit and keep
            your personal film
            lineup in one place.
          </p>

          <Link
            to="/login"
            className="btn btn-primary"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <MovieLoader
        message="Loading Watchlist..."
      />
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      {/* =====================
          HEADER
      ====================== */}

      <header className="watchlist-hero text-center">
        <span className="watchlist-eyebrow">
          Your Personal Collection
        </span>

        <h1 className="cinematic-heading">
          My Watchlist
        </h1>

        <p className="watchlist-subtitle">
          Your personal lineup
          of films to revisit.
        </p>

        {movies.length > 0 && (
          <span className="watchlist-count">
            {movies.length}{" "}
            {movies.length === 1
              ? "Film"
              : "Films"}
          </span>
        )}
      </header>

      {/* =====================
          EMPTY WATCHLIST
      ====================== */}

      {movies.length === 0 ? (
        <section className="watchlist-empty">
          <div className="watchlist-empty-icon">
            ★
          </div>

          <h2 className="cinematic-heading">
            Your Watchlist is Empty
          </h2>

          <p>
            Add movies from the
            filmography and they'll
            show up here whenever
            you're ready for your
            next movie night.
          </p>

          <Link
            to="/"
            className="btn btn-primary"
          >
            Browse Films
          </Link>
        </section>
      ) : (
        <>
          {/* =====================
              MOVIES
          ====================== */}

          <div className="row">
            {movies.map(
              (movie) => (
                <div
                  className="col-lg-3 col-md-4 col-sm-6 mb-4"
                  key={
                    movie._id
                  }
                >
                  <Link
                    to={`/movies/${movie._id}`}
                    className="text-decoration-none"
                  >
                    <div className="card h-100 watchlist-movie-card">
                      <div className="watchlist-poster-wrapper">
                        {movie.poster && (
                          <img
                            src={
                              movie.poster
                            }
                            alt={`${movie.title} poster`}
                            className="card-img-top movie-poster"
                          />
                        )}

                        <div className="watchlist-poster-badge">
                          Watchlist
                        </div>
                      </div>

                      <div className="card-body text-center">
                        <h5 className="card-title">
                          {
                            movie.title
                          }
                        </h5>

                        {movie.mpaRating && (
                          <div className="mb-3">
                            <span className="movie-rating-label">
                              {
                                movie.mpaRating
                              }
                            </span>
                          </div>
                        )}

                        <p className="card-text mb-2">
                          <strong>
                            Director:
                          </strong>{" "}
                          {
                            movie.director
                          }
                        </p>

                        <p className="card-text mb-2">
                          <strong>
                            Year:
                          </strong>{" "}
                          {
                            movie.year
                          }
                        </p>

                        <p className="card-text mb-0">
                          <strong>
                            Average Rating:
                          </strong>{" "}

                          {Number(
                            movie.reviewCount ||
                              0
                          ) > 0
                            ? `${Number(
                                movie.averageRating
                              ).toFixed(
                                1
                              )}/5`
                            : "No ratings yet"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            )}
          </div>
        </>
      )}

      {/* =====================
          DIRECTOR QUOTE
      ====================== */}

      <DirectorQuote
        director="Quentin Tarantino"
        quote="Movies are my religion and God is my patron."
      />
    </div>
  );
}

export default Watchlist;