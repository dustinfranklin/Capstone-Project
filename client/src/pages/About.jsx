import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DirectorQuote
  from "../components/DirectorQuote";

function About() {
  const [movies, setMovies] =
    useState([]);

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
        }
      } catch (error) {
        console.error(
          "About page movie fetch error:",
          error
        );
      }
    }

    getMovies();
  }, []);

  // =========================
  // MOVIE LINKS
  // =========================

  function MovieLink({
    title,
  }) {
    const movie =
      movies.find(
        (movie) =>
          movie.title ===
          title
      );

    if (!movie) {
      return (
        <em>{title}</em>
      );
    }

    return (
      <Link
        to={`/movies/${movie._id}`}
        className="about-movie-link"
      >
        <em>{title}</em>
      </Link>
    );
  }

  // =========================
  // DIRECTOR SHOWDOWN
  // =========================

  const directorStats =
    useMemo(() => {
      function getAverage(
        director
      ) {
        const ratedMovies =
          movies.filter(
            (movie) =>
              movie.director ===
                director &&
              Number(
                movie.reviewCount
              ) > 0
          );

        if (
          ratedMovies.length ===
          0
        ) {
          return null;
        }

        const total =
          ratedMovies.reduce(
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
          ratedMovies.length
        ).toFixed(1);
      }

      return {
        nolanAverage:
          getAverage(
            "Christopher Nolan"
          ),

        tarantinoAverage:
          getAverage(
            "Quentin Tarantino"
          ),
      };
    }, [movies]);

  return (
    <div className="about-page">
      {/* =====================
          PAGE HEADER
      ====================== */}

      <header className="about-hero text-center">
        <span className="about-eyebrow">
          Behind the Films
        </span>

        <h1 className="cinematic-heading">
          About
        </h1>

        <p className="about-hero-tagline">
          Two directors. Two
          unmistakable styles.
          One community built
          around a love of movies.
        </p>
      </header>

      {/* =====================
          CHRISTOPHER NOLAN
      ====================== */}

      <section className="about-director-card about-nolan-card">
        <div className="about-director-number">
          01
        </div>

        <div className="about-director-content">
          <div className="about-director-heading">
            <span className="about-director-first-name">
              Christopher
            </span>

            <h2>
              Nolan
            </h2>
          </div>

          <p>
            Christopher Nolan is
            a British-American
            filmmaker known for
            ambitious, large-scale
            films that often
            explore time, memory,
            identity, morality,
            and the nature of
            reality. From the
            fractured storytelling
            of{" "}
            <MovieLink title="Memento" />{" "}
            to the epic scale of{" "}
            <MovieLink title="The Dark Knight" />{" "}
            and{" "}
            <MovieLink title="Oppenheimer" />,
            Nolan has become one
            of the defining
            filmmakers of modern
            blockbuster cinema.
          </p>

        </div>
      </section>

      {/* =====================
          QUENTIN TARANTINO
      ====================== */}

      <section className="about-director-card about-tarantino-card">
        <div className="about-director-number">
          02
        </div>

        <div className="about-director-content">
          <div className="about-director-heading">
            <span className="about-director-first-name">
              Quentin
            </span>

            <h2>
              Tarantino
            </h2>
          </div>

          <p>
            Quentin Tarantino is
            an American filmmaker
            known for his
            distinctive dialogue,
            nonlinear
            storytelling,
            stylized violence,
            memorable characters,
            and deep affection
            for film history.
            Beginning with{" "}
            <MovieLink title="Reservoir Dogs" />{" "}
            and{" "}
            <MovieLink title="Pulp Fiction" />,
            and continuing
            through films such
            as{" "}
            <MovieLink title="Django Unchained" />,
            his filmography
            draws inspiration
            from crime films,
            westerns,
            martial-arts cinema,
            exploitation films,
            and numerous other
            genres while
            developing a style
            that is unmistakably
            his own.
          </p>
        </div>
      </section>

      {/* =====================
          CHRISTIN NOLANTINO
      ====================== */}

      <section className="about-site-card">
        <span className="about-site-kicker">
          The Community
        </span>

        <h2 className="cinematic-heading">
          Christin Nolantino
        </h2>

        <div className="about-site-divider">
          <span></span>

          <strong>
            CN
          </strong>

          <span></span>
        </div>

        <p>
          Christin Nolantino
          brings the filmographies
          of Christopher Nolan
          and Quentin Tarantino
          together in one place.
          Explore their films,
          learn more about each
          movie, watch trailers,
          see how the community
          rates them, and share
          your own reviews.
        </p>

        <p className="about-site-closing">
          Two very different
          filmmakers. One shared
          love of movies.
        </p>
      </section>

      {/* =====================
          DIRECTOR SHOWDOWN
      ====================== */}

      <section className="about-showdown-section">
        <div className="text-center">
          <span className="about-eyebrow">
            Community Ratings
          </span>

          <h2 className="cinematic-heading about-showdown-title">
            Director Showdown
          </h2>
        </div>

        <div className="director-showdown">
          <div className="row g-3 align-items-stretch">
            {/* NOLAN */}

            <div className="col-md-5">
              <div className="showdown-director-card h-100">
                <span className="showdown-first-name">
                  Christopher
                </span>

                <span className="showdown-last-name">
                  Nolan
                </span>

                <span className="showdown-rating">
                  {directorStats
                    .nolanAverage
                    ? `${directorStats.nolanAverage}/5`
                    : "No ratings"}
                </span>

                <span className="showdown-caption">
                  Average Film
                  Rating
                </span>
              </div>
            </div>

            {/* VS */}

            <div className="col-md-2 d-flex align-items-center justify-content-center">
              <div className="showdown-vs">
                VS
              </div>
            </div>

            {/* TARANTINO */}

            <div className="col-md-5">
              <div className="showdown-director-card h-100">
                <span className="showdown-first-name">
                  Quentin
                </span>

                <span className="showdown-last-name">
                  Tarantino
                </span>

                <span className="showdown-rating">
                  {directorStats
                    .tarantinoAverage
                    ? `${directorStats.tarantinoAverage}/5`
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
            that have received
            at least one
            community review.
          </p>
        </div>
      </section>

      {/* =====================
          DIRECTOR QUOTE
      ====================== */}

      <DirectorQuote
        director="Christopher Nolan"
        quote="Every film should have its own world, a logic and feel to it that expands beyond the exact image that the audience is seeing."
      />
    </div>
  );
}

export default About;