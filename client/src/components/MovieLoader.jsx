function MovieLoader({
  message = "Now Loading...",
}) {
  return (
    <div className="movie-loader-wrapper">
      <div className="movie-loader-reel">
        <div className="movie-loader-hole hole-one"></div>
        <div className="movie-loader-hole hole-two"></div>
        <div className="movie-loader-hole hole-three"></div>
        <div className="movie-loader-hole hole-four"></div>
        <div className="movie-loader-center"></div>
      </div>

      <p className="movie-loader-text">
        {message}
      </p>
    </div>
  );
}

export default MovieLoader;