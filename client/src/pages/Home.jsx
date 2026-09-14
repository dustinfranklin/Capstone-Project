import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import popcornBucket
  from "../images/popcorn-toggle.png";

const NOLAN = "Christopher Nolan";
const TARANTINO = "Quentin Tarantino";


/* =========================
   SMALL REUSABLE COMPONENTS
========================= */

function DirectorFilterCard({
  active,
  firstName,
  lastName,
  count,
  onClick,
}) {
  return (
    <div className="col-lg-4 col-md-4">
      <button
        type="button"
        className={`director-filter-card ${
          active ? "active" : ""
        }`}
        onClick={onClick}
      >
        {firstName && (
          <span className="director-filter-name">
            {firstName}
          </span>
        )}

        <span className="director-filter-label">
          {lastName}
        </span>

        <span className="director-filter-count">
          {count}{" "}
          {count === 1
            ? "Film"
            : "Films"}
        </span>
      </button>
    </div>
  );
}


function MovieCard({
  movie,
}) {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <Link
        to={`/movies/${movie._id}`}
        className="text-decoration-none"
      >
        <div className="card h-100">
          {movie.poster && (
            <img
              src={movie.poster}
              className="card-img-top movie-poster"
              alt={`${movie.title} poster`}
            />
          )}

          <div className="card-body text-center">
            <h5 className="card-title">
              {movie.title}
            </h5>

            {movie.mpaRating && (
              <div className="mb-3">
                <span className="movie-rating-label">
                  {movie.mpaRating}
                </span>
              </div>
            )}

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

              {movie.reviewCount > 0
                ? `${Number(
                    movie.averageRating
                  ).toFixed(1)}/5`
                : "No ratings yet"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}


function HighestRatedStat({
  label,
  movie,
}) {
  return (
    <div className="home-fixed-stat">
      <span className="home-fixed-stat-label">
        {label}
      </span>

      {movie ? (
        <>
          <Link
            to={`/movies/${movie._id}`}
            className="home-fixed-stat-title"
          >
            {movie.title}
          </Link>

          <span className="home-fixed-stat-value">
            ★{" "}
            {Number(
              movie.averageRating
            ).toFixed(1)}
            /5
          </span>

          <span className="home-fixed-stat-detail">
            {movie.reviewCount}{" "}
            {Number(
              movie.reviewCount
            ) === 1
              ? "review"
              : "reviews"}
          </span>
        </>
      ) : (
        <span className="home-fixed-stat-empty">
          No ratings yet
        </span>
      )}
    </div>
  );
}


function Home() {
  const [
    movies,
    setMovies,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

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


  /* =========================
     LOAD MOVIES
  ========================= */

  useEffect(() => {
    async function getMovies() {
      try {
        const response =
          await fetch(
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


  /* =========================
     GENRES
  ========================= */

  const genres =
    useMemo(() => {
      const allGenres =
        movies.flatMap(
          (movie) =>
            movie.genre || []
        );

      return [
        ...new Set(allGenres),
      ].sort();
    }, [movies]);


  /* =========================
     DIRECTOR COUNTS
  ========================= */

  const directorCounts =
    useMemo(() => {
      return {
        all:
          movies.length,

        nolan:
          movies.filter(
            (movie) =>
              movie.director ===
              NOLAN
          ).length,

        tarantino:
          movies.filter(
            (movie) =>
              movie.director ===
              TARANTINO
          ).length,
      };
    }, [movies]);


  /* =========================
     FILM STATISTICS
  ========================= */

  const filmStats =
    useMemo(() => {
      const ratedMovies =
        movies.filter(
          (movie) =>
            Number(
              movie.reviewCount
            ) > 0
        );

      function getHighestRated(
        director
      ) {
        const directorMovies =
          ratedMovies.filter(
            (movie) =>
              movie.director ===
              director
          );

        if (
          directorMovies.length === 0
        ) {
          return null;
        }

        return [
          ...directorMovies,
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

      const mostReviewed =
        movies.length > 0
          ? [...movies].sort(
              (a, b) =>
                Number(
                  b.reviewCount || 0
                ) -
                Number(
                  a.reviewCount || 0
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
              movie.reviewCount || 0
            ),
          0
        );

      return {
        highestNolan:
          getHighestRated(
            NOLAN
          ),

        highestTarantino:
          getHighestRated(
            TARANTINO
          ),

        mostReviewed,
        totalReviews,
      };
    }, [movies]);


  /* =========================
     FILTER / SORT MOVIES
  ========================= */

  const displayedMovies =
    useMemo(() => {
      let filteredMovies =
        actorSearchResults !== null
          ? [
              ...actorSearchResults,
            ]
          : [
              ...movies,
            ];

      const trimmedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      if (trimmedSearch) {
        filteredMovies =
          filteredMovies.filter(
            (movie) =>
              movie.title
                ?.toLowerCase()
                .includes(
                  trimmedSearch
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

      switch (
        sortOption
      ) {
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
              Number(
                b.averageRating || 0
              ) -
              Number(
                a.averageRating || 0
              )
          );
          break;

        case "lowest":
          filteredMovies.sort(
            (a, b) =>
              Number(
                a.averageRating || 0
              ) -
              Number(
                b.averageRating || 0
              )
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

        case "title-asc":
        default:
          filteredMovies.sort(
            (a, b) =>
              a.title.localeCompare(
                b.title
              )
          );
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


  /* =========================
     SORT CHANGE
  ========================= */

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


  /* =========================
     ACTOR SEARCH
  ========================= */

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


  /* =========================
     CLEAR FILTERS
  ========================= */

  function handleClearFilters() {
    setSearchTerm("");
    setActorSearchTerm("");
    setActorSearchResults(null);
    setActorSearchMessage("");
    setDirectorFilter("all");
    setGenreFilter("all");
    setSortOption(
      "title-asc"
    );
  }


  return (
    <div className="home-page">
      <h1 className="text-center mb-4 cinematic-heading">
        Filmography
      </h1>


      {/* =====================
          DIRECTOR FILTER
      ====================== */}

      <section className="director-filter-section mb-4">
        <h2 className="director-filter-heading text-center">
          Choose a Director
        </h2>

        <p className="director-filter-subtitle text-center">
          Explore the complete
          collection or focus on
          one filmmaker.
        </p>

        <div className="row g-3 justify-content-center">
          <DirectorFilterCard
            active={
              directorFilter ===
              "all"
            }
            lastName="All Films"
            count={
              directorCounts.all
            }
            onClick={() =>
              setDirectorFilter(
                "all"
              )
            }
          />

          <DirectorFilterCard
            active={
              directorFilter ===
              NOLAN
            }
            firstName="Christopher"
            lastName="Nolan"
            count={
              directorCounts.nolan
            }
            onClick={() =>
              setDirectorFilter(
                NOLAN
              )
            }
          />

          <DirectorFilterCard
            active={
              directorFilter ===
              TARANTINO
            }
            firstName="Quentin"
            lastName="Tarantino"
            count={
              directorCounts.tarantino
            }
            onClick={() =>
              setDirectorFilter(
                TARANTINO
              )
            }
          />
        </div>
      </section>


      {/* =====================
          SEARCH / FILTERS
      ====================== */}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 justify-content-center">
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
                    event.target.value
                  )
                }
              />
            </div>


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
                      event.target.value
                    )
                  }
                  disabled={
                    actorSearchLoading
                  }
                />
              </form>
            </div>


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


      {/* =====================
          MOVIE CARDS
      ====================== */}

      <div className="row">
        {displayedMovies.length >
        0 ? (
          displayedMovies.map(
            (movie) => (
              <MovieCard
                key={
                  movie._id
                }
                movie={
                  movie
                }
              />
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


      {/* =====================
          DIRECTOR QUOTES
      ====================== */}

      <section className="home-director-quotes">
        <div className="home-quote home-quote-nolan">
          <div className="home-quote-director">
            Christopher Nolan
          </div>

          <blockquote>
            “I don't look at the
            scale of films in
            terms of money or the
            physical size of what
            we're shooting. It's
            in terms of my life.”
          </blockquote>
        </div>

        <div className="home-quote-popcorn">
          <img
            src={popcornBucket}
            alt=""
          />
        </div>

        <div className="home-quote home-quote-tarantino">
          <div className="home-quote-director">
            Quentin Tarantino
          </div>

          <blockquote>
            “When I make a movie,
            I want it to be
            everything for me;
            like I would die for
            it.”
          </blockquote>
        </div>
      </section>


      {/* =====================
          FIXED FILM STATS
      ====================== */}

      <section
        className="home-fixed-stats-bar"
        aria-label="Film statistics"
      >
        <div className="home-fixed-stats-inner">
          <HighestRatedStat
            label="Highest Rated Nolan"
            movie={
              filmStats.highestNolan
            }
          />

          <HighestRatedStat
            label="Highest Rated Tarantino"
            movie={
              filmStats.highestTarantino
            }
          />


          <div className="home-fixed-stat">
            <span className="home-fixed-stat-label">
              Most Reviewed Film
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
                  className="home-fixed-stat-title"
                >
                  {
                    filmStats
                      .mostReviewed
                      .title
                  }
                </Link>

                <span className="home-fixed-stat-value">
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
                </span>
              </>
            ) : (
              <span className="home-fixed-stat-empty">
                No reviews yet
              </span>
            )}
          </div>


          <div className="home-fixed-stat">
            <span className="home-fixed-stat-label">
              Total Community Reviews
            </span>

            <span className="home-fixed-stat-total">
              {
                filmStats.totalReviews
              }
            </span>

            <span className="home-fixed-stat-detail">
              Across the entire
              collection
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;