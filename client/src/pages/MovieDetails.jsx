import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import MovieLoader from "../components/MovieLoader";

function MovieDetails({ currentUser }) {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [movieLoading, setMovieLoading] =
    useState(true);

  const [movieError, setMovieError] =
    useState("");

  const [rating, setRating] =
    useState(5);

  const [reviewText, setReviewText] =
    useState("");

  const [
    reviewMessage,
    setReviewMessage,
  ] = useState("");

  const [
    editingReviewId,
    setEditingReviewId,
  ] = useState(null);

  const [
    editRating,
    setEditRating,
  ] = useState(5);

  const [
    editReviewText,
    setEditReviewText,
  ] = useState("");

  const [
    isFavorite,
    setIsFavorite,
  ] = useState(false);

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);

  const [
    favoriteMessage,
    setFavoriteMessage,
  ] = useState("");

  const [
    reviewSort,
    setReviewSort,
  ] = useState("newest");

  useEffect(() => {
    async function getMovie() {
      try {
        setMovieLoading(true);
        setMovieError("");

        const response =
          await fetch(
            `http://localhost:4000/api/movies/${id}`
          );

        const data =
          await response.json();

        if (response.ok) {
          setMovie(data);
        } else {
          setMovieError(
            data.message ||
              "Could not load movie."
          );
        }
      } catch (error) {
        console.error(
          "Movie fetch error:",
          error
        );

        setMovieError(
          "Could not connect to the server."
        );
      } finally {
        setMovieLoading(false);
      }
    }

    getMovie();
  }, [id]);

  async function getReviews() {
    try {
      const response =
        await fetch(
          `http://localhost:4000/api/movies/${id}/reviews`
        );

      const data =
        await response.json();

      if (response.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error(
        "Reviews fetch error:",
        error
      );
    }
  }

  useEffect(() => {
    getReviews();
  }, [id]);

  useEffect(() => {
    async function checkFavoriteStatus() {
      if (!currentUser) {
        setIsFavorite(false);
        return;
      }

      try {
        const response =
          await fetch(
            `http://localhost:4000/api/users/${currentUser.id}/favorites`
          );

        const data =
          await response.json();

        if (response.ok) {
          const movieIsFavorite =
            data.some(
              (favoriteMovie) =>
                String(
                  favoriteMovie._id
                ) ===
                String(id)
            );

          setIsFavorite(
            movieIsFavorite
          );
        }
      } catch (error) {
        console.error(
          "Favorite check error:",
          error
        );
      }
    }

    checkFavoriteStatus();
  }, [currentUser, id]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (
              total,
              review
            ) =>
              total +
              Number(
                review.rating
              ),
            0
          ) /
          reviews.length
        ).toFixed(1)
      : null;

  const currentUserReview =
    currentUser
      ? reviews.find(
          (review) =>
            String(
              review.userId
            ) ===
            String(
              currentUser.id
            )
        )
      : null;

  const sortedReviews =
    useMemo(() => {
      const sorted = [
        ...reviews,
      ];

      switch (reviewSort) {
        case "oldest":
          sorted.sort(
            (a, b) =>
              new Date(
                a.reviewDate ||
                  0
              ) -
              new Date(
                b.reviewDate ||
                  0
              )
          );
          break;

        case "highest":
          sorted.sort(
            (a, b) =>
              Number(
                b.rating
              ) -
              Number(
                a.rating
              )
          );
          break;

        case "lowest":
          sorted.sort(
            (a, b) =>
              Number(
                a.rating
              ) -
              Number(
                b.rating
              )
          );
          break;

        case "newest":
        default:
          sorted.sort(
            (a, b) =>
              new Date(
                b.reviewDate ||
                  0
              ) -
              new Date(
                a.reviewDate ||
                  0
              )
          );
          break;
      }

      return sorted;
    }, [
      reviews,
      reviewSort,
    ]);

  function displayStars(
    ratingValue
  ) {
    const roundedRating =
      Math.round(
        Number(
          ratingValue
        )
      );

    return (
      <>
        {"★".repeat(
          roundedRating
        )}

        {"☆".repeat(
          5 -
            roundedRating
        )}
      </>
    );
  }

  function StarSelector({
    selectedRating,
    setSelectedRating,
  }) {
    return (
      <div
        className="star-rating"
        style={{
          fontSize: "2rem",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {[1, 2, 3, 4, 5].map(
          (starNumber) => (
            <span
              key={
                starNumber
              }
              onClick={() =>
                setSelectedRating(
                  starNumber
                )
              }
              style={{
                marginRight:
                  "5px",
              }}
            >
              {starNumber <=
              selectedRating
                ? "★"
                : "☆"}
            </span>
          )
        )}
      </div>
    );
  }

  async function handleFavoriteToggle() {
    if (!currentUser) {
      return;
    }

    try {
      setFavoriteLoading(
        true
      );

      setFavoriteMessage(
        ""
      );

      const response =
        await fetch(
          `http://localhost:4000/api/users/${currentUser.id}/favorites/${id}`,
          {
            method:
              isFavorite
                ? "DELETE"
                : "POST",
          }
        );

      const data =
        await response.json();

      if (response.ok) {
        setIsFavorite(
          !isFavorite
        );
      }

      setFavoriteMessage(
        data.message || ""
      );
    } catch (error) {
      console.error(
        "Favorite toggle error:",
        error
      );

      setFavoriteMessage(
        "Could not update watchlist."
      );
    } finally {
      setFavoriteLoading(
        false
      );
    }
  }

  async function handleReviewSubmit(
    event
  ) {
    event.preventDefault();

    if (!currentUser) {
      setReviewMessage(
        "You must be logged in to submit a review."
      );

      return;
    }

    try {
      const response =
        await fetch(
          `http://localhost:4000/api/movies/${id}/reviews`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                userId:
                  currentUser.id,

                rating:
                  Number(
                    rating
                  ),

                review:
                  reviewText,
              }),
          }
        );

      const data =
        await response.json();

      setReviewMessage(
        data.message
      );

      if (response.ok) {
        setRating(5);

        setReviewText(
          ""
        );

        await getReviews();
      }
    } catch (error) {
      console.error(
        "Submit review error:",
        error
      );

      setReviewMessage(
        "Could not connect to the server"
      );
    }
  }

  function startEditing(
    review
  ) {
    setEditingReviewId(
      review._id
    );

    setEditRating(
      Number(
        review.rating
      )
    );

    setEditReviewText(
      review.review
    );

    setReviewMessage(
      ""
    );
  }

  function cancelEditing() {
    setEditingReviewId(
      null
    );

    setEditRating(5);

    setEditReviewText(
      ""
    );
  }

  async function handleEditSubmit(
    event,
    reviewId
  ) {
    event.preventDefault();

    try {
      const response =
        await fetch(
          `http://localhost:4000/api/reviews/${reviewId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                userId:
                  currentUser.id,

                rating:
                  Number(
                    editRating
                  ),

                review:
                  editReviewText,
              }),
          }
        );

      const data =
        await response.json();

      setReviewMessage(
        data.message
      );

      if (response.ok) {
        setEditingReviewId(
          null
        );

        setEditRating(5);

        setEditReviewText(
          ""
        );

        await getReviews();
      }
    } catch (error) {
      console.error(
        "Edit review error:",
        error
      );

      setReviewMessage(
        "Could not connect to the server"
      );
    }
  }

  async function handleDelete(
    reviewId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this review?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `http://localhost:4000/api/reviews/${reviewId}`,
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                userId:
                  currentUser.id,
              }),
          }
        );

      const data =
        await response.json();

      setReviewMessage(
        data.message
      );

      if (response.ok) {
        await getReviews();
      }
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      setReviewMessage(
        "Could not connect to the server"
      );
    }
  }

  if (movieLoading) {
    return (
      <MovieLoader
        message="Loading Film..."
      />
    );
  }

  if (movieError) {
    return (
      <div className="alert alert-danger text-center">
        {movieError}
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <div>
      {/* MOVIE INFORMATION */}

      <div className="row align-items-start mb-5 g-4">
        {/* POSTER */}

        <div className="col-lg-3 col-md-4">
          {movie.poster && (
            <img
              src={
                movie.poster
              }
              alt={`${movie.title} poster`}
              className="img-fluid rounded shadow movie-details-poster"
            />
          )}
        </div>

        {/* DETAILS */}

        <div className="col-lg-5 col-md-8 text-center">
          <h1 className="cinematic-heading movie-details-title">
            {
              movie.title
            }
          </h1>

          {movie.mpaRating && (
            <div className="mb-3">
              <span className="movie-rating-label">
                {
                  movie.mpaRating
                }
              </span>
            </div>
          )}

          {movie.synopsis && (
            <p className="movie-synopsis">
              {
                movie.synopsis
              }
            </p>
          )}

          <div className="movie-details-info">
            <p>
              <strong>
                Year:
              </strong>{" "}
              {
                movie.year
              }
            </p>

            <p>
              <strong>
                Genre:
              </strong>{" "}

              {Array.isArray(
                movie.genre
              )
                ? movie.genre.join(
                    ", "
                  )
                : movie.genre}
            </p>

            <p>
              <strong>
                Director:
              </strong>{" "}
              {
                movie.director
              }
            </p>

            <p>
              <strong>
                Average Rating:
              </strong>{" "}

              {averageRating ? (
                <>
                  <span className="star-rating">
                    {displayStars(
                      averageRating
                    )}
                  </span>{" "}

                  (
                  {
                    averageRating
                  }
                  /5)
                </>
              ) : (
                "No ratings yet"
              )}
            </p>

            <p>
              <strong>
                Number of Reviews:
              </strong>{" "}
              {
                reviews.length
              }
            </p>
          </div>

          {/* WATCHLIST */}

          <div className="mt-4">
            {currentUser ? (
              <>
                <button
                  type="button"
                  className={
                    isFavorite
                      ? "btn btn-danger"
                      : "btn btn-outline-danger"
                  }
                  onClick={
                    handleFavoriteToggle
                  }
                  disabled={
                    favoriteLoading
                  }
                >
                  {favoriteLoading
                    ? "Updating..."
                    : isFavorite
                      ? "♥ In Watchlist"
                      : "♡ Add to Watchlist"}
                </button>

                {favoriteMessage && (
                  <div className="mt-2">
                    <small>
                      {
                        favoriteMessage
                      }
                    </small>
                  </div>
                )}
              </>
            ) : (
              <div className="alert alert-secondary mt-3">
                Log in to add
                this movie to
                your watchlist.
              </div>
            )}
          </div>
        </div>

        {/* TRAILER */}

        <div className="col-lg-4 col-md-12">
          {movie.trailerId ? (
            <div className="movie-trailer-section">
              <h3 className="text-center mb-3">
                Trailer
              </h3>

              <div className="ratio ratio-16x9 trailer-container">
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailerId}`}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="alert alert-secondary">
              Trailer
              unavailable.
            </div>
          )}
        </div>
      </div>

      <hr />

      {/* REVIEWS */}

      <div className="review-section-header mb-4">
        <h2 className="mb-0">
          Reviews
        </h2>

        {reviews.length >
          1 && (
          <div className="review-sort-control">
            <label
              htmlFor="reviewSort"
              className="form-label mb-1"
            >
              Sort Reviews
            </label>

            <select
              id="reviewSort"
              className="form-select"
              value={
                reviewSort
              }
              onChange={(
                event
              ) =>
                setReviewSort(
                  event
                    .target
                    .value
                )
              }
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="highest">
                Highest Rated
              </option>

              <option value="lowest">
                Lowest Rated
              </option>
            </select>
          </div>
        )}
      </div>

      {reviewMessage && (
        <div className="alert alert-info">
          {
            reviewMessage
          }
        </div>
      )}

      {reviews.length ===
        0 && (
        <div className="alert alert-secondary">
          No reviews yet. Be
          the first to review
          this movie.
        </div>
      )}

      {sortedReviews.map(
        (review) => {
          const isCurrentUser =
            currentUser &&
            String(
              review.userId
            ) ===
              String(
                currentUser.id
              );

          return (
            <div
              className="card mb-3 shadow-sm"
              key={
                review._id
              }
            >
              <div className="card-body">
                {editingReviewId ===
                review._id ? (
                  <form
                    onSubmit={(
                      event
                    ) =>
                      handleEditSubmit(
                        event,
                        review._id
                      )
                    }
                  >
                    <div className="mb-3">
                      <label className="form-label">
                        Rating
                      </label>

                      <StarSelector
                        selectedRating={
                          editRating
                        }
                        setSelectedRating={
                          setEditRating
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Review
                      </label>

                      <textarea
                        className="form-control"
                        rows="4"
                        value={
                          editReviewText
                        }
                        onChange={(
                          event
                        ) =>
                          setEditReviewText(
                            event
                              .target
                              .value
                          )
                        }
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary me-2"
                    >
                      Save Changes
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={
                        cancelEditing
                      }
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h5 className="card-title">
                      {review.userName ||
                        "Unknown User"}
                    </h5>

                    <p className="mb-2">
                      <strong>
                        Rating:
                      </strong>{" "}

                      <span className="star-rating">
                        {displayStars(
                          review.rating
                        )}
                      </span>
                    </p>

                    <p className="card-text">
                      {
                        review.review
                      }
                    </p>

                    {review.reviewDate && (
                      <p className="text-muted mb-2">
                        {new Date(
                          review.reviewDate
                        ).toLocaleDateString()}
                      </p>
                    )}

                    {isCurrentUser && (
                      <div>
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() =>
                            startEditing(
                              review
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() =>
                            handleDelete(
                              review._id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        }
      )}

      <hr className="my-5" />

      {/* WRITE REVIEW */}

      <h2 className="mb-4">
        Write a Review
      </h2>

      {!currentUser ? (
        <div className="alert alert-warning">
          You must be logged
          in to write a
          review.
        </div>
      ) : currentUserReview ? (
        <div className="alert alert-info">
          You have already
          reviewed this movie.
          You can edit your
          existing review
          above.
        </div>
      ) : (
        <form
          onSubmit={
            handleReviewSubmit
          }
          className="mb-5"
        >
          <div className="mb-3">
            <label className="form-label">
              Rating
            </label>

            <StarSelector
              selectedRating={
                rating
              }
              setSelectedRating={
                setRating
              }
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="reviewText"
              className="form-label"
            >
              Review
            </label>

            <textarea
              id="reviewText"
              className="form-control"
              rows="5"
              value={
                reviewText
              }
              onChange={(
                event
              ) =>
                setReviewText(
                  event
                    .target
                    .value
                )
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}

export default MovieDetails;