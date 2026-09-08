import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [movies, setMovies] = useState([]);
  const [message, setMessage] = useState(
    "Loading movies..."
  );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [directorFilter, setDirectorFilter] =
    useState("All");

  const [genreFilter, setGenreFilter] =
    useState("All");

  const [sortOption, setSortOption] =
    useState("title-asc");

  useEffect(() => {
    async function getMovies() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/movies"
        );

        const data = await response.json();

        if (response.ok) {
          setMovies(data);
          setMessage("");
        } else {
          setMessage(
            "Could not load movies"
          );
        }
      } catch (error) {
        console.error(
          "Movie fetch error:",
          error
        );

        setMessage(
          "Could not connect to the server"
        );
      }
    }

    getMovies();
  }, []);

  const directors = [
    ...new Set(
      movies
        .map((movie) => movie.director)
        .filter(Boolean)
    ),
  ].sort();

  const genres = [
    ...new Set(
      movies
        .map((movie) => movie.genre)
        .filter(Boolean)
    ),
  ].sort();

  const filteredMovies = movies.filter(
    (movie) => {
      const matchesSearch =
        movie.title
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesDirector =
        directorFilter === "All" ||
        movie.director === directorFilter;

      const matchesGenre =
        genreFilter === "All" ||
        movie.genre === genreFilter;

      return (
        matchesSearch &&
        matchesDirector &&
        matchesGenre
      );
    }
  );

  const sortedMovies = [...filteredMovies].sort(
    (a, b) => {
      if (sortOption === "title-asc") {
        return a.title.localeCompare(
          b.title
        );
      }

      if (sortOption === "title-desc") {
        return b.title.localeCompare(
          a.title
        );
      }

      if (sortOption === "year-desc") {
        return Number(b.year) - Number(a.year);
      }

      if (sortOption === "year-asc") {
        return Number(a.year) - Number(b.year);
      }

      if (sortOption === "rating-desc") {
        return (
          Number(b.averageRating || 0) -
          Number(a.averageRating || 0)
        );
      }

      if (sortOption === "rating-asc") {
        return (
          Number(a.averageRating || 0) -
          Number(b.averageRating || 0)
        );
      }

      return 0;
    }
  );

  function clearFilters() {
    setSearchTerm("");
    setDirectorFilter("All");
    setGenreFilter("All");
    setSortOption("title-asc");
  }

  return (
    <div>
      <h1 className="mb-4">
        Movies
      </h1>

      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">
                Search Movies
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">
                Director
              </label>

              <select
                className="form-select"
                value={directorFilter}
                onChange={(event) =>
                  setDirectorFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Directors
                </option>

                {directors.map(
                  (director) => (
                    <option
                      key={director}
                      value={director}
                    >
                      {director}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">
                Genre
              </label>

              <select
                className="form-select"
                value={genreFilter}
                onChange={(event) =>
                  setGenreFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Genres
                </option>

                {genres.map((genre) => (
                  <option
                    key={genre}
                    value={genre}
                  >
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">
                Sort By
              </label>

              <select
                className="form-select"
                value={sortOption}
                onChange={(event) =>
                  setSortOption(
                    event.target.value
                  )
                }
              >
                <option value="title-asc">
                  Title A-Z
                </option>

                <option value="title-desc">
                  Title Z-A
                </option>

                <option value="year-desc">
                  Newest First
                </option>

                <option value="year-asc">
                  Oldest First
                </option>

                <option value="rating-desc">
                  Highest Rated
                </option>

                <option value="rating-asc">
                  Lowest Rated
                </option>
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {!message && (
        <p className="text-muted">
          Showing {sortedMovies.length}{" "}
          {sortedMovies.length === 1
            ? "movie"
            : "movies"}
        </p>
      )}

      {sortedMovies.length === 0 &&
        !message && (
          <div className="alert alert-warning">
            No movies match your search.
          </div>
        )}

      <div className="row">
        {sortedMovies.map((movie) => (
          <div
            className="col-sm-6 col-md-4 col-lg-3 mb-4"
            key={movie._id}
          >
            <Link
              to={`/movies/${movie._id}`}
              className="text-decoration-none text-dark"
            >
              <div className="card h-100 shadow-sm">
                {movie.poster && (
                  <img
                    src={movie.poster}
                    className="card-img-top movie-poster"
                    alt={`${movie.title} poster`}
                  />
                )}

                <div className="card-body">
                  <h5 className="card-title">
                    {movie.title}
                  </h5>

                  <p className="card-text mb-2">
                    <strong>
                      Director:
                    </strong>{" "}
                    {movie.director}
                  </p>

                  <p className="card-text mb-0">
                    <strong>
                      Average Rating:
                    </strong>{" "}
                    {movie.averageRating !== null
                      ? `${Number(
                          movie.averageRating
                        ).toFixed(1)}/5`
                      : "No ratings yet"}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;