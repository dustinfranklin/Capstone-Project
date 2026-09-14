import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import MovieLoader from "../components/MovieLoader";

function Profile({
  currentUser,
  setCurrentUser,
}) {
  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    uploadingPicture,
    setUploadingPicture,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });

  useEffect(() => {
    async function getProfile() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessage("");

        const response =
          await fetch(
            `http://localhost:4000/api/users/${currentUser.id}/profile`
          );

        const data =
          await response.json();

        if (response.ok) {
          setProfile(
            data
          );

          setFormData({
            firstName:
              data.user
                .firstName ||
              "",

            lastName:
              data.user
                .lastName ||
              "",

            bio:
              data.user.bio ||
              "",
          });

          setImagePreview(
            data.user
              .profilePic ||
              ""
          );
        } else {
          setMessage(
            data.message ||
              "Could not load profile."
          );
        }
      } catch (error) {
        console.error(
          "Profile fetch error:",
          error
        );

        setMessage(
          "Could not connect to the server."
        );
      } finally {
        setLoading(
          false
        );
      }
    }

    getProfile();
  }, [currentUser]);

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }

  function handleFileChange(
    event
  ) {
    const file =
      event.target
        .files?.[0];

    setMessage("");

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setMessage(
        "Please choose a JPG, PNG, or WEBP image."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Profile pictures must be 5 MB or smaller."
      );

      return;
    }

    setSelectedFile(
      file
    );

    setImagePreview(
      URL.createObjectURL(
        file
      )
    );
  }

  async function handlePictureUpload() {
    if (!selectedFile) {
      setMessage(
        "Please choose an image first."
      );

      return;
    }

    try {
      setUploadingPicture(
        true
      );

      setMessage("");

      const uploadData =
        new FormData();

      uploadData.append(
        "profilePicture",
        selectedFile
      );

      const response =
        await fetch(
          `http://localhost:4000/api/users/${currentUser.id}/profile-picture`,
          {
            method: "POST",
            body: uploadData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not upload profile picture."
        );

        return;
      }

      setProfile(
        (current) => ({
          ...current,

          user: {
            ...current.user,

            profilePic:
              data.profilePic,
          },
        })
      );

      setImagePreview(
        data.profilePic
      );

      setSelectedFile(
        null
      );

      const updatedUser = {
        ...currentUser,

        profilePic:
          data.profilePic,
      };

      setCurrentUser(
        updatedUser
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify(
          updatedUser
        )
      );

      setMessage(
        "Profile picture updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile picture upload error:",
        error
      );

      setMessage(
        "Could not connect to the server."
      );
    } finally {
      setUploadingPicture(
        false
      );
    }
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setMessage("");

      const response =
        await fetch(
          `http://localhost:4000/api/users/${currentUser.id}/profile`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                formData
              ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Could not update profile."
        );

        return;
      }

      setProfile(
        (current) => ({
          ...current,
          user:
            data.user,
        })
      );

      const updatedUser = {
        ...currentUser,

        firstName:
          data.user
            .firstName,

        lastName:
          data.user
            .lastName,

        profilePic:
          data.user
            .profilePic,

        bio:
          data.user.bio,
      };

      setCurrentUser(
        updatedUser
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify(
          updatedUser
        )
      );

      setEditing(
        false
      );

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setMessage(
        "Could not connect to the server."
      );
    }
  }

  function displayStars(
    ratingValue
  ) {
    const rounded =
      Math.round(
        Number(
          ratingValue
        )
      );

    return (
      <>
        {"★".repeat(
          rounded
        )}

        {"☆".repeat(
          5 - rounded
        )}
      </>
    );
  }

  function getInitials() {
    const firstInitial =
      profile?.user
        ?.firstName?.[0] ||
      "";

    const lastInitial =
      profile?.user
        ?.lastName?.[0] ||
      "";

    return (
      firstInitial +
      lastInitial
    ).toUpperCase();
  }

  if (!currentUser) {
    return (
      <div>
        <h1 className="cinematic-heading text-center mb-4">
          My Profile
        </h1>

        <div className="alert alert-warning text-center">
          You must be logged
          in to view your
          profile.
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="btn btn-primary"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <MovieLoader
        message="Loading Profile..."
      />
    );
  }

  if (!profile) {
    return (
      <div className="alert alert-danger text-center">
        {message ||
          "Could not load profile."}
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="cinematic-heading text-center mb-4">
        My Profile
      </h1>

      {message && (
        <div className="alert alert-info text-center">
          {
            message
          }
        </div>
      )}

      {/* PROFILE INFORMATION */}

      <div className="card profile-main-card mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center g-4">
            {/* PROFILE PICTURE */}

            <div className="col-lg-4 text-center">
              {imagePreview ? (
                <img
                  src={
                    imagePreview
                  }
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  {
                    getInitials()
                  }
                </div>
              )}

              <div className="mt-3">
                <label
                  htmlFor="profilePicture"
                  className="form-label fw-bold"
                >
                  Profile Picture
                </label>

                <input
                  id="profilePicture"
                  className="form-control"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={
                    handleFileChange
                  }
                />

                <div className="form-text">
                  JPG, PNG, or
                  WEBP. Maximum
                  file size:
                  5 MB.
                </div>

                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={
                    handlePictureUpload
                  }
                  disabled={
                    !selectedFile ||
                    uploadingPicture
                  }
                >
                  {uploadingPicture
                    ? "Uploading..."
                    : "Save Profile Picture"}
                </button>
              </div>
            </div>

            {/* PROFILE INFO */}

            <div className="col-lg-8">
              {!editing ? (
                <>
                  <h2 className="cinematic-heading">
                    {
                      profile.user
                        .firstName
                    }{" "}
                    {
                      profile.user
                        .lastName
                    }
                  </h2>

                  <div className="profile-username">
                    @
                    {
                      profile.user
                        .username
                    }
                  </div>

                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {
                      profile.user
                        .email
                    }
                  </p>

                  <div className="profile-bio">
                    <h5>
                      About Me
                    </h5>

                    {profile.user
                      .bio ? (
                      <p>
                        {
                          profile.user
                            .bio
                        }
                      </p>
                    ) : (
                      <p className="profile-bio-empty">
                        No bio added
                        yet.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={() =>
                      setEditing(
                        true
                      )
                    }
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="profile-edit-card"
                >
                  <div className="mb-3">
                    <label
                      htmlFor="firstName"
                      className="form-label"
                    >
                      First Name
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="form-control"
                      value={
                        formData
                          .firstName
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="lastName"
                      className="form-label"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="form-control"
                      value={
                        formData
                          .lastName
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="bio"
                      className="form-label"
                    >
                      Bio
                    </label>

                    <textarea
                      id="bio"
                      name="bio"
                      className="form-control"
                      rows="5"
                      maxLength="300"
                      value={
                        formData.bio
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <div className="form-text">
                      {
                        formData.bio
                          .length
                      }
                      /300
                    </div>
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
                    onClick={() => {
                      setEditing(
                        false
                      );

                      setFormData({
                        firstName:
                          profile.user
                            .firstName ||
                          "",

                        lastName:
                          profile.user
                            .lastName ||
                          "",

                        bio:
                          profile.user
                            .bio ||
                          "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE STATS */}

      <div className="row g-3 mb-5">
        <div className="col-md-4">
          <div className="card profile-stat-card h-100">
            <div className="card-body text-center">
              <h3>
                {
                  profile.stats
                    .reviewCount
                }
              </h3>

              <p className="mb-0">
                Reviews Written
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card profile-stat-card h-100">
            <div className="card-body text-center">
              <h3>
                {profile.stats
                  .reviewCount >
                0
                  ? Number(
                      profile.stats
                        .averageRating
                    ).toFixed(
                      1
                    )
                  : "—"}
              </h3>

              <p className="mb-0">
                Average Rating
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card profile-stat-card h-100">
            <div className="card-body text-center">
              <h3>
                {
                  profile.stats
                    .watchlistCount
                }
              </h3>

              <p className="mb-0">
                Watchlist Films
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* USER REVIEWS */}

      <section className="profile-reviews-section">
        <h2 className="cinematic-heading mb-4">
          My Reviews
        </h2>

        {profile.reviews
          .length === 0 ? (
          <div className="alert alert-secondary">
            You haven't
            reviewed any
            movies yet.
          </div>
        ) : (
          profile.reviews.map(
            (review) => (
              <div
                className="card profile-review-card mb-3"
                key={
                  review._id
                }
              >
                <div className="card-body">
                  <div className="row align-items-center g-3">
                    {review.moviePoster && (
                      <div className="col-md-auto text-center">
                        <img
                          src={
                            review.moviePoster
                          }
                          alt={`${review.movieTitle} poster`}
                          className="profile-review-poster"
                        />
                      </div>
                    )}

                    <div className="col">
                      <h4>
                        {review.movieTitle ||
                          "Unknown Movie"}
                      </h4>

                      {review.movieDirector && (
                        <p className="mb-2 text-muted">
                          {
                            review.movieDirector
                          }
                        </p>
                      )}

                      <p className="mb-2">
                        <span className="star-rating">
                          {displayStars(
                            review.rating
                          )}
                        </span>{" "}

                        (
                        {
                          review.rating
                        }
                        /5)
                      </p>

                      <p className="profile-review-text">
                        {
                          review.review
                        }
                      </p>

                      {review.reviewDate && (
                        <p className="text-muted small">
                          {new Date(
                            review.reviewDate
                          ).toLocaleDateString()}
                        </p>
                      )}

                      {review.movieId && (
                        <Link
                          to={`/movies/${review.movieId}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Movie
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </section>
    </div>
  );
}

export default Profile;