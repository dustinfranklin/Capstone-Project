import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import MovieLoader from "../components/MovieLoader";

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
          setMovies(
            data
          );
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
        setLoading(
          false
        );
      }
    }

    getWatchlist();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div>
        <h1 className="text-center mb-4 cinematic-heading">
          My Watchlist
        </h1>

        <div className="alert alert-warning text-center">
          You must be logged
          in to view your
          watchlist.
        </div>

        <div className="text-center">
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

  if (loading) {
    return (
      <MovieLoader
        message="Loading Watchlist..."
      />
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      <h1 className="text-center mb-2 cinematic-heading">
        My Watchlist
      </h1>

      <p className="text-center mb-4">
        Your personal lineup
        of films to revisit.
      </p>

      {movies.length ===
      0 ? (
        <div className="card watchlist-empty-card">
          <div className="card-body text-center p-5">
            <h3>
              Your Watchlist
              is Empty
            </h3>

            <p className="mb-4">
              Add movies from
              the filmography
              and they'll show
              up here.
            </p>

            <Link
              to="/"
              className="btn btn-primary"
            >
              Browse Films
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-center mb-4">
            {movies.length}{" "}
            {movies.length ===
            1
              ? "film"
              : "films"}{" "}
            in your watchlist
          </p>

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
                      {movie.poster && (
                        <img
                          src={
                            movie.poster
                          }
                          alt={`${movie.title} poster`}
                          className="card-img-top movie-poster"
                        />
                      )}

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
                            Average
                            Rating:
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
    </div>
  );
}

export default Watchlist;