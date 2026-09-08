import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function MovieDetails({ currentUser }) {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [message, setMessage] = useState("Loading movie...");

  const [reviews, setReviews] = useState([]);
  const [reviewMessage, setReviewMessage] = useState(
    "Loading reviews..."
  );

  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const [editingReviewId, setEditingReviewId] =
    useState(null);
  const [editRating, setEditRating] = useState("5");
  const [editReviewText, setEditReviewText] =
    useState("");

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : null;

  const currentUserReview = currentUser
    ? reviews.find(
        (review) =>
          String(review.userId) ===
          String(currentUser.id)
      )
    : null;

  async function getReviews() {
    try {
      const response = await fetch(
        `http://localhost:4000/api/movies/${id}/reviews`
      );

      const data = await response.json();

      if (response.ok) {
        setReviews(data);
        setReviewMessage("");
      } else {
        setReviewMessage("Could not load reviews");
      }
    } catch (error) {
      console.error("Review fetch error:", error);
      setReviewMessage(
        "Could not connect to the server"
      );
    }
  }

  useEffect(() => {
    async function getMovie() {
      try {
        const response = await fetch(
          `http://localhost:4000/api/movies/${id}`
        );

        const data = await response.json();

        if (response.ok) {
          setMovie(data);
          setMessage("");
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        console.error(
          "Movie details error:",
          error
        );

        setMessage(
          "Could not connect to the server"
        );
      }
    }

    getMovie();
  }, [id]);

  useEffect(() => {
    getReviews();
  }, [id]);

  async function handleReviewSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:4000/api/movies/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
            rating,
            review: reviewText,
          }),
        }
      );

      const data = await response.json();

      setSubmitMessage(data.message);

      if (response.ok) {
        setRating("5");
        setReviewText("");

        await getReviews();
      }
    } catch (error) {
      console.error(
        "Submit review error:",
        error
      );

      setSubmitMessage(
        "Could not connect to the server"
      );
    }
  }

  function startEditing(review) {
    setEditingReviewId(review._id);
    setEditRating(String(review.rating));
    setEditReviewText(review.review);
  }

  function cancelEditing() {
    setEditingReviewId(null);
    setEditRating("5");
    setEditReviewText("");
  }

  async function handleEditSubmit(
    event,
    reviewId
  ) {
    event.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:4000/api/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
            rating: editRating,
            review: editReviewText,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEditingReviewId(null);
        setEditRating("5");
        setEditReviewText("");

        await getReviews();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(
        "Edit review error:",
        error
      );
    }
  }

  async function handleDelete(reviewId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage("");

        await getReviews();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );
    }
  }

  if (message) {
    return (
      <div className="alert alert-info">
        {message}
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <div>
      <Link
        to="/"
        className="btn btn-outline-secondary mb-4"
      >
        Back to Movies
      </Link>

      <div className="row">
        <div className="col-md-4">
          {movie.poster && (
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              className="img-fluid rounded shadow"
            />
          )}
        </div>

        <div className="col-md-8">
          <h1 className="mb-4">
            {movie.title}
          </h1>

          <p className="fs-5">
            <strong>Year:</strong>{" "}
            {movie.year}
          </p>

          <p className="fs-5">
            <strong>Director:</strong>{" "}
            {movie.director}
          </p>

          <p className="fs-5">
            <strong>Genre:</strong>{" "}
            {movie.genre}
          </p>

          <p className="fs-5">
            <strong>
              Average Rating:
            </strong>{" "}
            {averageRating
              ? `${averageRating}/5`
              : "No ratings yet"}
          </p>

          <p className="text-muted">
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </p>
        </div>
      </div>

      <hr className="my-5" />

      <h2 className="mb-4">
        Reviews
      </h2>

      {reviewMessage && (
        <div className="alert alert-info">
          {reviewMessage}
        </div>
      )}

      {reviews.length === 0 &&
        !reviewMessage && (
          <p>No reviews yet.</p>
        )}

      {reviews.map((review) => {
        const isOwnReview =
          currentUser &&
          String(review.userId) ===
            String(currentUser.id);

        return (
          <div
            className="card mb-3 shadow-sm"
            key={review._id}
          >
            <div className="card-body">
              <h5 className="card-title">
                {review.userName ||
                  "Unknown User"}
              </h5>

              {editingReviewId ===
              review._id ? (
                <form
                  onSubmit={(event) =>
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

                    <select
                      className="form-select"
                      value={editRating}
                      onChange={(event) =>
                        setEditRating(
                          event.target.value
                        )
                      }
                    >
                      <option value="5">
                        5 - Excellent
                      </option>

                      <option value="4">
                        4 - Very Good
                      </option>

                      <option value="3">
                        3 - Good
                      </option>

                      <option value="2">
                        2 - Fair
                      </option>

                      <option value="1">
                        1 - Poor
                      </option>
                    </select>
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
                      onChange={(event) =>
                        setEditReviewText(
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success me-2"
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
                  <p className="mb-2">
                    <strong>
                      Rating:
                    </strong>{" "}
                    {review.rating}/5
                  </p>

                  <p className="card-text">
                    {review.review}
                  </p>

                  <small className="text-muted d-block mb-3">
                    Reviewed:{" "}
                    {review.reviewDate}
                  </small>

                  {isOwnReview && (
                    <>
                      <button
                        className="btn btn-outline-primary me-2"
                        onClick={() =>
                          startEditing(
                            review
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-outline-danger"
                        onClick={() =>
                          handleDelete(
                            review._id
                          )
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      <hr className="my-5" />

      {currentUser ? (
        currentUserReview ? (
          <>
            <h2 className="mb-4">
              Your Review
            </h2>

            <div className="alert alert-success">
              You have already reviewed
              this movie. Use the Edit
              button on your review above
              if you want to make changes.
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4">
              Write a Review
            </h2>

            {submitMessage && (
              <div className="alert alert-info">
                {submitMessage}
              </div>
            )}

            <form
              onSubmit={
                handleReviewSubmit
              }
            >
              <div className="mb-3">
                <label className="form-label">
                  Rating
                </label>

                <select
                  className="form-select"
                  value={rating}
                  onChange={(event) =>
                    setRating(
                      event.target.value
                    )
                  }
                >
                  <option value="5">
                    5 - Excellent
                  </option>

                  <option value="4">
                    4 - Very Good
                  </option>

                  <option value="3">
                    3 - Good
                  </option>

                  <option value="2">
                    2 - Fair
                  </option>

                  <option value="1">
                    1 - Poor
                  </option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Review
                </label>

                <textarea
                  className="form-control"
                  rows="5"
                  value={reviewText}
                  onChange={(event) =>
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
          </>
        )
      ) : (
        <>
          <h2 className="mb-4">
            Write a Review
          </h2>

          <div className="alert alert-warning">
            You must be logged in to
            write a review.
          </div>
        </>
      )}
    </div>
  );
}

export default MovieDetails;