import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import MovieLoader
  from "../components/MovieLoader";

import DirectorQuote
  from "../components/DirectorQuote";


/* =========================
   STAR HELPERS
========================= */

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
        5 - roundedRating
      )}
    </>
  );
}


function StarSelector({
  selectedRating,
  setSelectedRating,
}) {
  return (
    <div className="movie-star-selector">
      {[1, 2, 3, 4, 5].map(
        (starNumber) => (
          <button
            key={
              starNumber
            }
            type="button"
            className="movie-star-button"
            onClick={() =>
              setSelectedRating(
                starNumber
              )
            }
            aria-label={`${starNumber} star rating`}
          >
            {starNumber <=
            selectedRating
              ? "★"
              : "☆"}
          </button>
        )
      )}
    </div>
  );
}


/* =========================
   REVIEW CARD
========================= */

function ReviewCard({
  review,
  currentUser,
  editingReviewId,
  editRating,
  setEditRating,
  editReviewText,
  setEditReviewText,
  handleEditSubmit,
  cancelEditing,
  startEditing,
  handleDelete,
}) {
  const isCurrentUser =
    currentUser &&
    String(
      review.userId
    ) ===
      String(
        currentUser.id
      );

  const isEditing =
    editingReviewId ===
    review._id;

  return (
    <article className="movie-review-card">
      {isEditing ? (
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
            <label className="form-label movie-review-label">
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
            <label className="form-label movie-review-label">
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
                  event.target.value
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
          <div className="movie-review-top">
            <div>
              <span className="movie-review-member-label">
                Film Club Member
              </span>

              <h4 className="movie-review-user">
                {review.userName ||
                  "Unknown User"}
              </h4>
            </div>

            <div className="movie-review-score">
              <span className="star-rating">
                {displayStars(
                  review.rating
                )}
              </span>

              <span>
                {review.rating}/5
              </span>
            </div>
          </div>

          <p className="movie-review-text">
            {review.review}
          </p>

          <div className="movie-review-footer">
            {review.reviewDate && (
              <span className="movie-review-date">
                {new Date(
                  review.reviewDate
                ).toLocaleDateString()}
              </span>
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
          </div>
        </>
      )}
    </article>
  );
}


/* =========================
   MOVIE DETAILS
========================= */

function MovieDetails({
  currentUser,
}) {
  const {
    id,
  } = useParams();

  const [
    movie,
    setMovie,
  ] = useState(null);

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    movieLoading,
    setMovieLoading,
  ] = useState(true);

  const [
    movieError,
    setMovieError,
  ] = useState("");

  const [
    rating,
    setRating,
  ] = useState(5);

  const [
    reviewText,
    setReviewText,
  ] = useState("");

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


  /* =========================
     LOAD MOVIE
  ========================= */

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


  /* =========================
     LOAD REVIEWS
  ========================= */

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


  /* =========================
     CHECK WATCHLIST
  ========================= */

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
          setIsFavorite(
            data.some(
              (favoriteMovie) =>
                String(
                  favoriteMovie._id
                ) ===
                String(id)
            )
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
  }, [
    currentUser,
    id,
  ]);


  /* =========================
     DERIVED REVIEW DATA
  ========================= */

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

      switch (
        reviewSort
      ) {
        case "oldest":
          sorted.sort(
            (a, b) =>
              new Date(
                a.reviewDate || 0
              ) -
              new Date(
                b.reviewDate || 0
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
                b.reviewDate || 0
              ) -
              new Date(
                a.reviewDate || 0
              )
          );
          break;
      }

      return sorted;
    }, [
      reviews,
      reviewSort,
    ]);


  /* =========================
     WATCHLIST
  ========================= */

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
          (current) =>
            !current
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


  /* =========================
     SUBMIT REVIEW
  ========================= */

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
        setReviewText("");

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


  /* =========================
     EDIT REVIEW
  ========================= */

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

    setReviewMessage("");
  }


  function cancelEditing() {
    setEditingReviewId(
      null
    );

    setEditRating(5);
    setEditReviewText("");
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
        cancelEditing();

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


  /* =========================
     DELETE REVIEW
  ========================= */

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
            method: "DELETE",

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


  /* =========================
     LOADING / ERROR
  ========================= */

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
    <div className="movie-details-page">
      {/* =====================
          FEATURE PRESENTATION
      ====================== */}

      <section className="movie-details-hero">
        <div className="row align-items-start g-4">
          {/* POSTER */}

          <div className="col-lg-3 col-md-4">
            <div className="movie-details-poster-wrapper">
              {movie.poster && (
                <img
                  src={
                    movie.poster
                  }
                  alt={`${movie.title} poster`}
                  className="movie-details-poster"
                />
              )}
            </div>
          </div>


          {/* DETAILS */}

          <div className="col-lg-5 col-md-8">
            <div className="movie-details-content">
              <span className="movie-details-eyebrow">
                Feature Presentation
              </span>

              <h1 className="cinematic-heading movie-details-title">
                {movie.title}
              </h1>

              <div className="movie-details-meta-row">
                {movie.year && (
                  <span>
                    {movie.year}
                  </span>
                )}

                {movie.mpaRating && (
                  <span className="movie-rating-label">
                    {movie.mpaRating}
                  </span>
                )}

                {movie.director && (
                  <span>
                    {movie.director}
                  </span>
                )}
              </div>

              {movie.synopsis && (
                <p className="movie-synopsis">
                  {movie.synopsis}
                </p>
              )}

              <div className="movie-details-info-grid">
                <div className="movie-detail-stat">
                  <span className="movie-detail-label">
                    Genre
                  </span>

                  <span className="movie-detail-value">
                    {Array.isArray(
                      movie.genre
                    )
                      ? movie.genre.join(
                          ", "
                        )
                      : movie.genre}
                  </span>
                </div>


                <div className="movie-detail-stat">
                  <span className="movie-detail-label">
                    Community Rating
                  </span>

                  <span className="movie-detail-value">
                    {averageRating ? (
                      <>
                        <span className="star-rating">
                          {displayStars(
                            averageRating
                          )}
                        </span>{" "}

                        {averageRating}/5
                      </>
                    ) : (
                      "No ratings yet"
                    )}
                  </span>
                </div>


                <div className="movie-detail-stat">
                  <span className="movie-detail-label">
                    Reviews
                  </span>

                  <span className="movie-detail-value">
                    {reviews.length}
                  </span>
                </div>


                <div className="movie-detail-stat">
                  <span className="movie-detail-label">
                    Director
                  </span>

                  <span className="movie-detail-value">
                    {movie.director}
                  </span>
                </div>
              </div>


              {/* WATCHLIST */}

              <div className="movie-details-watchlist">
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
                      <div className="movie-watchlist-message">
                        {favoriteMessage}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="movie-login-note">
                    <Link to="/login">
                      Log in
                    </Link>{" "}
                    to add this movie
                    to your watchlist.
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* TRAILER */}

          <div className="col-lg-4 col-md-12">
            <div className="movie-trailer-card">
              <span className="movie-details-eyebrow">
                Now Playing
              </span>

              <h2 className="cinematic-heading">
                Trailer
              </h2>

              {movie.trailerId ? (
                <div className="ratio ratio-16x9 trailer-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.trailerId}`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="movie-trailer-unavailable">
                  Trailer unavailable.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* =====================
          REVIEWS
      ====================== */}

      <section className="movie-reviews-section">
        <div className="movie-section-header">
          <div>
            <span className="movie-details-eyebrow">
              Community
            </span>

            <h2 className="cinematic-heading">
              Reviews
            </h2>
          </div>

          {reviews.length > 1 && (
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
                    event.target.value
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
            {reviewMessage}
          </div>
        )}


        {reviews.length === 0 && (
          <div className="movie-no-reviews">
            <h4>
              No Reviews Yet
            </h4>

            <p>
              Be the first member
              to review this film.
            </p>
          </div>
        )}


        <div className="movie-review-list">
          {sortedReviews.map(
            (review) => (
              <ReviewCard
                key={
                  review._id
                }
                review={
                  review
                }
                currentUser={
                  currentUser
                }
                editingReviewId={
                  editingReviewId
                }
                editRating={
                  editRating
                }
                setEditRating={
                  setEditRating
                }
                editReviewText={
                  editReviewText
                }
                setEditReviewText={
                  setEditReviewText
                }
                handleEditSubmit={
                  handleEditSubmit
                }
                cancelEditing={
                  cancelEditing
                }
                startEditing={
                  startEditing
                }
                handleDelete={
                  handleDelete
                }
              />
            )
          )}
        </div>
      </section>


      {/* =====================
          WRITE REVIEW
      ====================== */}

      <section className="movie-write-review-section">
        <div className="movie-section-heading-centered">
          <span className="movie-details-eyebrow">
            Your Take
          </span>

          <h2 className="cinematic-heading">
            Write a Review
          </h2>
        </div>


        {!currentUser ? (
          <div className="movie-review-login-card">
            <p>
              You must be logged
              in to write a
              review.
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
            >
              Log In
            </Link>
          </div>
        ) : currentUserReview ? (
          <div className="movie-review-existing-card">
            You have already
            reviewed this movie.
            You can edit your
            existing review above.
          </div>
        ) : (
          <form
            onSubmit={
              handleReviewSubmit
            }
            className="movie-review-form"
          >
            <div className="mb-3">
              <label className="form-label movie-review-label">
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
                className="form-label movie-review-label"
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
                    event.target.value
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
      </section>


      {/* =====================
          DIRECTOR QUOTE
      ====================== */}

      <DirectorQuote
        director="Christopher Nolan"
        quote="I think there's a vague sense out there that movies are becoming more and more unreal. I know I've felt it."
      />
    </div>
  );
}

export default MovieDetails;