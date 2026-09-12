import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

function Home() {
  const [movies, setMovies] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    actorSearchTerm,
    setActorSearchTerm,
  ] = useState("");

  const [
    actorSearchResults,
    setActorSearchResults,
  ] = useState(null);

  const [
    actorSearchMessage,
    setActorSearchMessage,
  ] = useState("");

  const [
    actorSearchLoading,
    setActorSearchLoading,
  ] = useState(false);

  const [
    directorFilter,
    setDirectorFilter,
  ] = useState("all");

  const [
    genreFilter,
    setGenreFilter,
  ] = useState("all");

  const [
    sortOption,
    setSortOption,
  ] = useState("title-asc");

  const [
    nolanSeed,
    setNolanSeed,
  ] = useState(0);

  useEffect(() => {
    async function getMovies() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/movies"
        );

        const data =
          await response.json();

        if (response.ok) {
          setMovies(data);
        } else {
          console.error(
            "Could not load movies:",
            data
          );
        }
      } catch (error) {
        console.error(
          "Movie fetch error:",
          error
        );
      }
    }

    getMovies();
  }, []);

  const directors = useMemo(() => {
    return [
      ...new Set(
        movies
          .map(
            (movie) =>
              movie.director
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [movies]);

  const genres = useMemo(() => {
    const allGenres =
      movies.flatMap(
        (movie) =>
          movie.genre || []
      );

    return [
      ...new Set(allGenres),
    ].sort();
  }, [movies]);

  const displayedMovies =
    useMemo(() => {
      let filteredMovies =
        actorSearchResults !== null
          ? [...actorSearchResults]
          : [...movies];

      if (searchTerm.trim()) {
        filteredMovies =
          filteredMovies.filter(
            (movie) =>
              movie.title
                ?.toLowerCase()
                .includes(
                  searchTerm
                    .trim()
                    .toLowerCase()
                )
          );
      }

      if (
        directorFilter !== "all"
      ) {
        filteredMovies =
          filteredMovies.filter(
            (movie) =>
              movie.director ===
              directorFilter
          );
      }

      if (
        genreFilter !== "all"
      ) {
        filteredMovies =
          filteredMovies.filter(
            (movie) =>
              Array.isArray(
                movie.genre
              ) &&
              movie.genre.includes(
                genreFilter
              )
          );
      }

      switch (sortOption) {
        case "title-asc":
          filteredMovies.sort(
            (a, b) =>
              a.title.localeCompare(
                b.title
              )
          );
          break;

        case "title-desc":
          filteredMovies.sort(
            (a, b) =>
              b.title.localeCompare(
                a.title
              )
          );
          break;

        case "oldest":
          filteredMovies.sort(
            (a, b) =>
              a.year - b.year
          );
          break;

        case "newest":
          filteredMovies.sort(
            (a, b) =>
              b.year - a.year
          );
          break;

        case "highest":
          filteredMovies.sort(
            (a, b) =>
              (b.averageRating || 0) -
              (a.averageRating || 0)
          );
          break;

        case "lowest":
          filteredMovies.sort(
            (a, b) =>
              (a.averageRating || 0) -
              (b.averageRating || 0)
          );
          break;

        case "nolan":
          for (
            let i =
              filteredMovies.length - 1;
            i > 0;
            i--
          ) {
            const j =
              Math.floor(
                Math.random() *
                  (i + 1)
              );

            [
              filteredMovies[i],
              filteredMovies[j],
            ] = [
              filteredMovies[j],
              filteredMovies[i],
            ];
          }
          break;

        default:
          break;
      }

      return filteredMovies;
    }, [
      movies,
      actorSearchResults,
      searchTerm,
      directorFilter,
      genreFilter,
      sortOption,
      nolanSeed,
    ]);

  function handleSortChange(
    event
  ) {
    const newSort =
      event.target.value;

    setSortOption(newSort);

    if (newSort === "nolan") {
      setNolanSeed(
        (current) =>
          current + 1
      );
    }
  }

  async function handleActorSearch(
    event
  ) {
    if (event) {
      event.preventDefault();
    }

    const actorName =
      actorSearchTerm.trim();

    if (!actorName) {
      setActorSearchResults(
        null
      );

      setActorSearchMessage("");

      return;
    }

    try {
      setActorSearchLoading(
        true
      );

      setActorSearchMessage("");

      const response =
        await fetch(
          `http://localhost:4000/api/movies/search-by-actor?name=${encodeURIComponent(
            actorName
          )}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        setActorSearchResults(
          []
        );

        setActorSearchMessage(
          data.message ||
            "Could not search for that actor."
        );

        return;
      }

      setActorSearchResults(
        data.movies || []
      );

      if (
        !data.movies ||
        data.movies.length === 0
      ) {
        setActorSearchMessage(
          data.message ||
            "Sorry! They're not in these movies!"
        );
      } else {
        setActorSearchMessage(
          `Showing movies featuring ${data.actor}.`
        );
      }
    } catch (error) {
      console.error(
        "Actor search error:",
        error
      );

      setActorSearchResults(
        []
      );

      setActorSearchMessage(
        "Could not search for that actor."
      );
    } finally {
      setActorSearchLoading(
        false
      );
    }
  }

  function handleClearFilters() {
    setSearchTerm("");

    setActorSearchTerm("");

    setActorSearchResults(
      null
    );

    setActorSearchMessage("");

    setDirectorFilter("all");

    setGenreFilter("all");

    setSortOption(
      "title-asc"
    );
  }

  return (
    <div>
      <h1 className="text-center mb-4 cinematic-heading">
        Filmography
      </h1>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* SEARCH MOVIES */}
            <div className="col-lg-3 col-md-6">
              <label
                htmlFor="movieSearch"
                className="form-label"
              >
                Search Movies
              </label>

              <input
                id="movieSearch"
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

            {/* SEARCH BY ACTOR */}
            <div className="col-lg-3 col-md-6">
              <label
                htmlFor="actorSearch"
                className="form-label"
              >
                Search by Actor
              </label>

              <form
                onSubmit={
                  handleActorSearch
                }
              >
                <input
                  id="actorSearch"
                  type="text"
                  className="form-control"
                  placeholder={
                    actorSearchLoading
                      ? "Searching..."
                      : "Enter actor name..."
                  }
                  value={
                    actorSearchTerm
                  }
                  onChange={(event) =>
                    setActorSearchTerm(
                      event.target.value
                    )
                  }
                  disabled={
                    actorSearchLoading
                  }
                />
              </form>
            </div>

            {/* DIRECTOR */}
            <div className="col-lg-2 col-md-4">
              <label
                htmlFor="directorFilter"
                className="form-label"
              >
                Director
              </label>

              <select
                id="directorFilter"
                className="form-select"
                value={
                  directorFilter
                }
                onChange={(event) =>
                  setDirectorFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
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

            {/* GENRE */}
            <div className="col-lg-2 col-md-4">
              <label
                htmlFor="genreFilter"
                className="form-label"
              >
                Genre
              </label>

              <select
                id="genreFilter"
                className="form-select"
                value={genreFilter}
                onChange={(event) =>
                  setGenreFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Genres
                </option>

                {genres.map(
                  (genre) => (
                    <option
                      key={genre}
                      value={genre}
                    >
                      {genre}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* SORT */}
            <div className="col-lg-2 col-md-4">
              <label
                htmlFor="sortOption"
                className="form-label"
              >
                Sort By
              </label>

              <select
                id="sortOption"
                className="form-select"
                value={sortOption}
                onChange={
                  handleSortChange
                }
              >
                <option value="title-asc">
                  Title A-Z
                </option>

                <option value="title-desc">
                  Title Z-A
                </option>

                <option value="oldest">
                  Oldest to Newest
                </option>

                <option value="newest">
                  Newest to Oldest
                </option>

                <option value="highest">
                  Highest Rated
                </option>

                <option value="lowest">
                  Lowest Rated
                </option>

                <option value="nolan">
                  Nolan Timeline ⏳
                </option>
              </select>
            </div>
          </div>

          {/* ACTOR SEARCH MESSAGE */}
          {actorSearchMessage && (
            <div
              className={`alert ${
                actorSearchResults
                  ?.length > 0
                  ? "alert-success"
                  : "alert-secondary"
              } text-center mt-3 mb-0`}
            >
              {
                actorSearchMessage
              }
            </div>
          )}

          {/* SEARCH + CLEAR FILTERS */}
          <div className="mt-3 d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={
                handleActorSearch
              }
              disabled={
                actorSearchLoading
              }
            >
              {actorSearchLoading
                ? "Searching..."
                : "Search"}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* MOVIE CARDS */}
      <div className="row">
        {displayedMovies.length > 0 ? (
          displayedMovies.map(
            (movie) => (
              <div
                className="col-lg-3 col-md-4 col-sm-6 mb-4"
                key={movie._id}
              >
                <Link
                  to={`/movies/${movie._id}`}
                  className="text-decoration-none"
                >
                  <div className="card h-100">
                    {movie.poster && (
                      <img
                        src={
                          movie.poster
                        }
                        className="card-img-top movie-poster"
                        alt={`${movie.title} poster`}
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

                      <p className="card-text mb-0">
                        <strong>
                          Average Rating:
                        </strong>{" "}
                        {movie.reviewCount >
                        0 ? (
                          <>
                            {Number(
                              movie.averageRating
                            ).toFixed(
                              1
                            )}
                            /5
                          </>
                        ) : (
                          "No ratings yet"
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )
          )
        ) : (
          !actorSearchMessage && (
            <div className="col-12">
              <div className="alert alert-secondary text-center">
                No movies match your search.
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Home;