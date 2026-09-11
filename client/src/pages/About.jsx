import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function About() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function getMovies() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/movies"
        );

        const data = await response.json();

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

  function MovieLink({ title }) {
    const movie = movies.find(
      (movie) => movie.title === title
    );

    if (!movie) {
      return <em>{title}</em>;
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

  return (
    <div className="about-page">
      <h1 className="text-center cinematic-heading mb-5">
        About
      </h1>

      <div className="card about-card mb-4">
        <div className="card-body p-4">
          <h2 className="cinematic-heading">
            Christopher Nolan
          </h2>

          <p>
            Christopher Nolan is a British-American
            filmmaker known for ambitious, large-scale
            films that often explore time, memory,
            identity, morality, and the nature of
            reality. From the fractured storytelling of{" "}
            <MovieLink title="Memento" /> to the epic
            scale of <MovieLink title="The Dark Knight" />{" "}
            and <MovieLink title="Oppenheimer" />, Nolan
            has become one of the defining filmmakers
            of modern blockbuster cinema.
          </p>
        </div>
      </div>

      <div className="card about-card mb-4">
        <div className="card-body p-4">
          <h2 className="cinematic-heading">
            Quentin Tarantino
          </h2>

          <p>
            Quentin Tarantino is an American filmmaker
            known for his distinctive dialogue,
            nonlinear storytelling, stylized violence,
            memorable characters, and deep affection
            for film history. Beginning with{" "}
            <MovieLink title="Reservoir Dogs" /> and{" "}
            <MovieLink title="Pulp Fiction" />, and
            continuing through films such as{" "}
            <MovieLink title="Django Unchained" />,
            his filmography draws inspiration from crime
            films, westerns, martial-arts cinema,
            exploitation films, and numerous other
            genres while developing a style that is
            unmistakably his own.
          </p>
        </div>
      </div>

      <div className="card about-card mb-5">
        <div className="card-body p-4 text-center">
          <h2 className="cinematic-heading">
            Christin Nolantino
          </h2>

          <p className="mb-0">
            Christin Nolantino brings the filmographies
            of Christopher Nolan and Quentin Tarantino
            together in one place. Explore their films,
            learn more about each movie, watch trailers,
            see how the community rates them, and share
            your own reviews. Two very different
            filmmakers. One shared love of movies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;