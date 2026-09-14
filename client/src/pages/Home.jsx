import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import MovieLoader from "../components/MovieLoader";

function Home() {
  const [movies, setMovies] = useState([]);

  const [moviesLoading, setMoviesLoading] =
    useState(true);

  const [movieLoadError, setMovieLoadError] =
    useState("");

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
        setMoviesLoading(true);
        setMovieLoadError("");

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

          setMovieLoadError(
            data.message ||
              "Could not load the filmography."
          );
        }
      } catch (error) {
        console.error(
          "Movie fetch error:",
          error
        );

        setMovieLoadError(
          "Could not connect to the server."
        );
      } finally {
        setMoviesLoading(false);
      }
    }

    getMovies();
  }, []);

  const genres =
    useMemo(() => {
      const allGenres =
        movies.flatMap(
          (movie) =>
            movie.genre || []
        );

      return [
        ...new Set(
          allGenres
        ),
      ].sort();
    }, [movies]);

  const directorCounts =
    useMemo(() => {
      return {
        all: movies.length,

        nolan: movies.filter(
          (movie) =>
            movie.director ===
            "Christopher Nolan"
        ).length,

        tarantino:
          movies.filter(
            (movie) =>
              movie.director ===
              "Quentin Tarantino"
          ).length,
      };
    }, [movies]);

  const filmStats =
    useMemo(() => {
      const ratedMovies =
        movies.filter(
          (movie) =>
            Number(
              movie.reviewCount
            ) > 0
        );

      const nolanMovies =
        ratedMovies.filter(
          (movie) =>
            movie.director ===
            "Christopher Nolan"
        );

      const tarantinoMovies =
        ratedMovies.filter(
          (movie) =>
            movie.director ===
            "Quentin Tarantino"
        );

      function getHighestRated(
        movieList
      ) {
        if (
          movieList.length ===
          0
        ) {
          return null;
        }

        return [
          ...movieList,
        ].sort(
          (a, b) =>
            Number(
              b.averageRating
            ) -
            Number(
              a.averageRating
            )
        )[0];
      }

      function getDirectorAverage(
        movieList
      ) {
        if (
          movieList.length ===
          0
        ) {
          return null;
        }

        const total =
          movieList.reduce(
            (
              sum,
              movie
            ) =>
              sum +
              Number(
                movie.averageRating
              ),
            0
          );

        return (
          total /
          movieList.length
        ).toFixed(1);
      }

      const mostReviewed =
        movies.length > 0
          ? [
              ...movies,
            ].sort(
              (a, b) =>
                Number(
                  b.reviewCount ||
                    0
                ) -
                Number(
                  a.reviewCount ||
                    0
                )
            )[0]
          : null;

      const totalReviews =
        movies.reduce(
          (
            total,
            movie
          ) =>
            total +
            Number(
              movie.reviewCount ||
                0
            ),
          0
        );

      return {
        highestNolan:
          getHighestRated(
            nolanMovies
          ),

        highestTarantino:
          getHighestRated(
            tarantinoMovies
          ),

        mostReviewed,

        nolanAverage:
          getDirectorAverage(
            nolanMovies
          ),

        tarantinoAverage:
          getDirectorAverage(
            tarantinoMovies
          ),

        totalReviews,
      };
    }, [movies]);

  const displayedMovies =
    useMemo(() => {
      let filteredMovies =
        actorSearchResults !==
        null
          ? [
              ...actorSearchResults,
            ]
          : [...movies];

      if (
        searchTerm.trim()
      ) {
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
        directorFilter !==
        "all"
      ) {
        filteredMovies =
          filteredMovies.filter(
            (movie) =>
              movie.director ===
              directorFilter
          );
      }

      if (
        genreFilter !==
        "all"
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

      switch (
        sortOption
      ) {
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
              a.year -
              b.year
          );
          break;

        case "newest":
          filteredMovies.sort(
            (a, b) =>
              b.year -
              a.year
          );
          break;

        case "highest":
          filteredMovies.sort(
            (a, b) =>
              (b.averageRating ||
                0) -
              (a.averageRating ||
                0)
          );
          break;

        case "lowest":
          filteredMovies.sort(
            (a, b) =>
              (a.averageRating ||
                0) -
              (b.averageRating ||
                0)
          );
          break;

        case "nolan":
          for (
            let i =
              filteredMovies.length -
              1;
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

    setSortOption(
      newSort
    );

    if (
      newSort === "nolan"
    ) {
      setNolanSeed(
        (current) =>
          current + 1
      );
    }
  }

  function handleDirectorChange(
    director
  ) {
    setDirectorFilter(
      director
    );
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

      setActorSearchMessage(
        ""
      );

      return;
    }

    try {
      setActorSearchLoading(
        true
      );

      setActorSearchMessage(
        ""
      );

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
        data.movies.length ===
          0
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

    setActorSearchTerm(
      ""
    );

    setActorSearchResults(
      null
    );

    setActorSearchMessage(
      ""
    );

    setDirectorFilter(
      "all"
    );

    setGenreFilter(
      "all"
    );

    setSortOption(
      "title-asc"
    );
  }

  if (moviesLoading) {
    return (
      <MovieLoader
        message="Loading Filmography..."
      />
    );
  }

  if (movieLoadError) {
    return (
      <div className="alert alert-danger text-center">
        {movieLoadError}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center mb-4 cinematic-heading">
        Filmography
      </h1>

      {/* DIRECTOR FILTER CARDS */}

      <section className="director-filter-section mb-4">
        <h2 className="director-filter-heading text-center">
          Choose a Director
        </h2>

        <p className="director-filter-subtitle text-center">
          Explore the complete
          collection or focus
          on one filmmaker.
        </p>

        <div className="row g-3 justify-content-center">
          {/* ALL FILMS */}

          <div className="col-lg-4 col-md-4">
            <button
              type="button"
              className={`director-filter-card ${
                directorFilter ===
                "all"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleDirectorChange(
                  "all"
                )
              }
            >
              <span className="director-filter-label">
                All Films
              </span>

              <span className="director-filter-count">
                {
                  directorCounts.all
                }{" "}
                {directorCounts.all ===
                1
                  ? "Film"
                  : "Films"}
              </span>
            </button>
          </div>

          {/* CHRISTOPHER NOLAN */}

          <div className="col-lg-4 col-md-4">
            <button
              type="button"
              className={`director-filter-card ${
                directorFilter ===
                "Christopher Nolan"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleDirectorChange(
                  "Christopher Nolan"
                )
              }
            >
              <span className="director-filter-name">
                Christopher
              </span>

              <span className="director-filter-label">
                Nolan
              </span>

              <span className="director-filter-count">
                {
                  directorCounts.nolan
                }{" "}
                {directorCounts.nolan ===
                1
                  ? "Film"
                  : "Films"}
              </span>
            </button>
          </div>

          {/* QUENTIN TARANTINO */}

          <div className="col-lg-4 col-md-4">
            <button
              type="button"
              className={`director-filter-card ${
                directorFilter ===
                "Quentin Tarantino"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleDirectorChange(
                  "Quentin Tarantino"
                )
              }
            >
              <span className="director-filter-name">
                Quentin
              </span>

              <span className="director-filter-label">
                Tarantino
              </span>

              <span className="director-filter-count">
                {
                  directorCounts.tarantino
                }{" "}
                {directorCounts.tarantino ===
                1
                  ? "Film"
                  : "Films"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* FILM STATISTICS */}

      <section className="film-statistics-section mb-4">
        <div className="text-center mb-4">
          <h2 className="film-statistics-heading">
            Film Statistics
          </h2>

          <p className="film-statistics-subtitle">
            How the two
            filmographies stack
            up according to the
            Christin Nolantino
            community.
          </p>
        </div>

        <div className="row g-3">
          {/* HIGHEST RATED NOLAN */}

          <div className="col-lg-3 col-md-6">
            <div className="film-stat-card h-100">
              <div className="film-stat-card-body">
                <span className="film-stat-kicker">
                  Highest Rated
                  Nolan
                </span>

                {filmStats.highestNolan ? (
                  <>
                    <Link
                      to={`/movies/${filmStats.highestNolan._id}`}
                      className="film-stat-movie"
                    >
                      {
                        filmStats
                          .highestNolan
                          .title
                      }
                    </Link>

                    <div className="film-stat-value">
                      ★{" "}
                      {Number(
                        filmStats
                          .highestNolan
                          .averageRating
                      ).toFixed(
                        1
                      )}
                      /5
                    </div>

                    <div className="film-stat-small">
                      {
                        filmStats
                          .highestNolan
                          .reviewCount
                      }{" "}
                      {Number(
                        filmStats
                          .highestNolan
                          .reviewCount
                      ) === 1
                        ? "review"
                        : "reviews"}
                    </div>
                  </>
                ) : (
                  <div className="film-stat-empty">
                    No ratings yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HIGHEST RATED TARANTINO */}

          <div className="col-lg-3 col-md-6">
            <div className="film-stat-card h-100">
              <div className="film-stat-card-body">
                <span className="film-stat-kicker">
                  Highest Rated
                  Tarantino
                </span>

                {filmStats.highestTarantino ? (
                  <>
                    <Link
                      to={`/movies/${filmStats.highestTarantino._id}`}
                      className="film-stat-movie"
                    >
                      {
                        filmStats
                          .highestTarantino
                          .title
                      }
                    </Link>

                    <div className="film-stat-value">
                      ★{" "}
                      {Number(
                        filmStats
                          .highestTarantino
                          .averageRating
                      ).toFixed(
                        1
                      )}
                      /5
                    </div>

                    <div className="film-stat-small">
                      {
                        filmStats
                          .highestTarantino
                          .reviewCount
                      }{" "}
                      {Number(
                        filmStats
                          .highestTarantino
                          .reviewCount
                      ) === 1
                        ? "review"
                        : "reviews"}
                    </div>
                  </>
                ) : (
                  <div className="film-stat-empty">
                    No ratings yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOST REVIEWED */}

          <div className="col-lg-3 col-md-6">
            <div className="film-stat-card h-100">
              <div className="film-stat-card-body">
                <span className="film-stat-kicker">
                  Most Reviewed
                  Film
                </span>

                {filmStats.mostReviewed &&
                Number(
                  filmStats
                    .mostReviewed
                    .reviewCount
                ) > 0 ? (
                  <>
                    <Link
                      to={`/movies/${filmStats.mostReviewed._id}`}
                      className="film-stat-movie"
                    >
                      {
                        filmStats
                          .mostReviewed
                          .title
                      }
                    </Link>

                    <div className="film-stat-value">
                      {
                        filmStats
                          .mostReviewed
                          .reviewCount
                      }{" "}
                      {Number(
                        filmStats
                          .mostReviewed
                          .reviewCount
                      ) === 1
                        ? "Review"
                        : "Reviews"}
                    </div>
                  </>
                ) : (
                  <div className="film-stat-empty">
                    No reviews yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TOTAL REVIEWS */}

          <div className="col-lg-3 col-md-6">
            <div className="film-stat-card h-100">
              <div className="film-stat-card-body">
                <span className="film-stat-kicker">
                  Total Community
                  Reviews
                </span>

                <div className="film-stat-total">
                  {
                    filmStats.totalReviews
                  }
                </div>

                <div className="film-stat-small">
                  Across the entire
                  collection
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DIRECTOR SHOWDOWN */}

        <div className="director-showdown mt-4">
          <h3 className="director-showdown-heading text-center">
            Director Showdown
          </h3>

          <div className="row g-3 align-items-stretch">
            <div className="col-md-5">
              <div className="showdown-director-card h-100">
                <span className="showdown-first-name">
                  Christopher
                </span>

                <span className="showdown-last-name">
                  Nolan
                </span>

                <span className="showdown-rating">
                  {filmStats.nolanAverage
                    ? `${filmStats.nolanAverage}/5`
                    : "No ratings"}
                </span>

                <span className="showdown-caption">
                  Average Film
                  Rating
                </span>
              </div>
            </div>

            <div className="col-md-2 d-flex align-items-center justify-content-center">
              <div className="showdown-vs">
                VS
              </div>
            </div>

            <div className="col-md-5">
              <div className="showdown-director-card h-100">
                <span className="showdown-first-name">
                  Quentin
                </span>

                <span className="showdown-last-name">
                  Tarantino
                </span>

                <span className="showdown-rating">
                  {filmStats.tarantinoAverage
                    ? `${filmStats.tarantinoAverage}/5`
                    : "No ratings"}
                </span>

                <span className="showdown-caption">
                  Average Film
                  Rating
                </span>
              </div>
            </div>
          </div>

          <p className="director-showdown-note text-center">
            Director averages
            include only films
            that have received at
            least one community
            review.
          </p>
        </div>
      </section>

      {/* SEARCH / FILTER CONTROLS */}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 justify-content-center">
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
                value={
                  searchTerm
                }
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target
                      .value
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
                  onChange={(
                    event
                  ) =>
                    setActorSearchTerm(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    actorSearchLoading
                  }
                />
              </form>
            </div>

            {/* GENRE */}

            <div className="col-lg-3 col-md-6">
              <label
                htmlFor="genreFilter"
                className="form-label"
              >
                Genre
              </label>

              <select
                id="genreFilter"
                className="form-select"
                value={
                  genreFilter
                }
                onChange={(
                  event
                ) =>
                  setGenreFilter(
                    event.target
                      .value
                  )
                }
              >
                <option value="all">
                  All Genres
                </option>

                {genres.map(
                  (genre) => (
                    <option
                      key={
                        genre
                      }
                      value={
                        genre
                      }
                    >
                      {
                        genre
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* SORT */}

            <div className="col-lg-3 col-md-6">
              <label
                htmlFor="sortOption"
                className="form-label"
              >
                Sort By
              </label>

              <select
                id="sortOption"
                className="form-select"
                value={
                  sortOption
                }
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
                  Oldest to
                  Newest
                </option>

                <option value="newest">
                  Newest to
                  Oldest
                </option>

                <option value="highest">
                  Highest Rated
                </option>

                <option value="lowest">
                  Lowest Rated
                </option>

                <option value="nolan">
                  Nolan Timeline
                  ⏳
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
        {displayedMovies.length >
        0 ? (
          displayedMovies.map(
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
                          Average
                          Rating:
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
                No movies match
                your search.
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Home;