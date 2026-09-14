import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import MovieLoader
  from "../components/MovieLoader";

import DirectorQuote
  from "../components/DirectorQuote";


/* =========================
   SMALL REUSABLE COMPONENTS
========================= */

function ProfileStat({
  number,
  label,
}) {
  return (
    <div className="col-md-4">
      <div className="profile-stat-card h-100">
        <span className="profile-stat-number">
          {number}
        </span>

        <span className="profile-stat-label">
          {label}
        </span>
      </div>
    </div>
  );
}


function ProfileReview({
  review,
  displayStars,
}) {
  return (
    <article className="profile-review-card">
      <div className="row align-items-center g-4">
        {review.moviePoster && (
          <div className="col-md-auto text-center">
            <img
              src={review.moviePoster}
              alt={`${review.movieTitle} poster`}
              className="profile-review-poster"
            />
          </div>
        )}

        <div className="col">
          <span className="profile-review-director">
            {review.movieDirector ||
              "Film Review"}
          </span>

          <h4 className="profile-review-title">
            {review.movieTitle ||
              "Unknown Movie"}
          </h4>

          <div className="profile-review-rating">
            <span className="star-rating">
              {displayStars(
                review.rating
              )}
            </span>

            <span>
              {review.rating}/5
            </span>
          </div>

          <p className="profile-review-text">
            {review.review}
          </p>

          {review.reviewDate && (
            <p className="profile-review-date">
              Reviewed{" "}
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
    </article>
  );
}


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
    previewUrl,
    setPreviewUrl,
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


  /* =========================
     LOAD PROFILE
  ========================= */

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

        if (!response.ok) {
          setMessage(
            data.message ||
              "Could not load profile."
          );

          return;
        }

        setProfile(data);

        setFormData({
          firstName:
            data.user.firstName ||
            "",

          lastName:
            data.user.lastName ||
            "",

          bio:
            data.user.bio || "",
        });

        setImagePreview(
          data.user.profilePic ||
            ""
        );
      } catch (error) {
        console.error(
          "Profile fetch error:",
          error
        );

        setMessage(
          "Could not connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [currentUser]);


  /* =========================
     CLEAN PREVIEW URL
  ========================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);


  /* =========================
     FORM CHANGE
  ========================= */

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


  /* =========================
     CANCEL EDITING
  ========================= */

  function handleCancelEdit() {
    setEditing(false);

    setFormData({
      firstName:
        profile.user.firstName ||
        "",

      lastName:
        profile.user.lastName ||
        "",

      bio:
        profile.user.bio ||
        "",
    });
  }


  /* =========================
     FILE CHANGE
  ========================= */

  function handleFileChange(
    event
  ) {
    const file =
      event.target.files?.[0];

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

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const newPreviewUrl =
      URL.createObjectURL(
        file
      );

    setSelectedFile(file);

    setPreviewUrl(
      newPreviewUrl
    );

    setImagePreview(
      newPreviewUrl
    );
  }


  /* =========================
     UPLOAD PICTURE
  ========================= */

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

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setPreviewUrl("");

      setImagePreview(
        data.profilePic
      );

      setSelectedFile(null);

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


  /* =========================
     SAVE PROFILE
  ========================= */

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
          user: data.user,
        })
      );

      const updatedUser = {
        ...currentUser,

        firstName:
          data.user.firstName,

        lastName:
          data.user.lastName,

        profilePic:
          data.user.profilePic,

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

      setEditing(false);

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


  /* =========================
     HELPERS
  ========================= */

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
        ?.firstName?.[0] || "";

    const lastInitial =
      profile?.user
        ?.lastName?.[0] || "";

    return (
      firstInitial +
      lastInitial
    ).toUpperCase();
  }


  /* =========================
     NOT LOGGED IN
  ========================= */

  if (!currentUser) {
    return (
      <div className="profile-page">
        <header className="profile-hero text-center">
          <span className="profile-eyebrow">
            Member Profile
          </span>

          <h1 className="cinematic-heading">
            My Profile
          </h1>
        </header>

        <div className="profile-login-card">
          <h3>
            Log In to View Your Profile
          </h3>

          <p>
            Sign in to manage
            your profile, see
            your reviews, and
            track your movie
            activity.
          </p>

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


  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <MovieLoader
        message="Loading Profile..."
      />
    );
  }


  /* =========================
     ERROR
  ========================= */

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
      {/* =====================
          HEADER
      ====================== */}

      <header className="profile-hero text-center">
        <span className="profile-eyebrow">
          Member Profile
        </span>

        <h1 className="cinematic-heading">
          My Profile
        </h1>

        <p className="profile-hero-subtitle">
          Your corner of
          Christin Nolantino.
        </p>
      </header>


      {/* MESSAGE */}

      {message && (
        <div className="alert alert-info text-center profile-message">
          {message}
        </div>
      )}


      {/* =====================
          PROFILE INFORMATION
      ====================== */}

      <section className="profile-main-card">
        <div className="row align-items-center g-4">
          {/* PROFILE PICTURE */}

          <div className="col-lg-4 text-center">
            <div className="profile-picture-upload-wrapper">
              <label
                htmlFor="profilePicture"
                className="profile-picture-upload-label"
                title="Change profile picture"
              >
                <div className="profile-picture-frame">
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
                      {getInitials()}
                    </div>
                  )}

                  <div className="profile-picture-overlay">
                    <span className="profile-picture-camera">
                      📷
                    </span>

                    <span>
                      Change Photo
                    </span>
                  </div>
                </div>
              </label>

              <input
                id="profilePicture"
                className="profile-picture-file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
              />

              {selectedFile && (
                <div className="profile-picture-save-area">
                  <div className="profile-picture-selected">
                    New photo selected
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={
                      handlePictureUpload
                    }
                    disabled={
                      uploadingPicture
                    }
                  >
                    {uploadingPicture
                      ? "Uploading..."
                      : "Save Profile Picture"}
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* PROFILE INFO */}

          <div className="col-lg-8">
            {!editing ? (
              <>
                <span className="profile-member-label">
                  Film Club Member
                </span>

                <h2 className="cinematic-heading profile-display-name">
                  {profile.user.firstName}{" "}
                  {profile.user.lastName}
                </h2>

                <div className="profile-username">
                  @{profile.user.username}
                </div>

                <div className="profile-email">
                  {profile.user.email}
                </div>

                <div className="profile-info-divider"></div>

                <div className="profile-bio">
                  <h5>
                    About Me
                  </h5>

                  {profile.user.bio ? (
                    <p>
                      {profile.user.bio}
                    </p>
                  ) : (
                    <p className="profile-bio-empty">
                      No bio added yet.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={() =>
                    setEditing(true)
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
                <div className="profile-edit-heading">
                  Edit Profile
                </div>

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
                      formData.firstName
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
                      formData.lastName
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
                      formData.bio.length
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
                  onClick={
                    handleCancelEdit
                  }
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </section>


      {/* =====================
          PROFILE STATS
      ====================== */}

      <section className="profile-stats-section">
        <div className="row g-3">
          <ProfileStat
            number={
              profile.stats.reviewCount
            }
            label="Reviews Written"
          />

          <ProfileStat
            number={
              profile.stats.reviewCount > 0
                ? Number(
                    profile.stats.averageRating
                  ).toFixed(1)
                : "—"
            }
            label="Average Rating"
          />

          <ProfileStat
            number={
              profile.stats.watchlistCount
            }
            label="Watchlist Films"
          />
        </div>
      </section>


      {/* =====================
          USER REVIEWS
      ====================== */}

      <section className="profile-reviews-section">
        <div className="profile-section-heading">
          <span className="profile-eyebrow">
            Your Film History
          </span>

          <h2 className="cinematic-heading">
            My Reviews
          </h2>
        </div>

        {profile.reviews.length ===
        0 ? (
          <div className="profile-no-reviews">
            <h4>
              No Reviews Yet
            </h4>

            <p>
              You haven't reviewed
              any movies yet.
            </p>

            <Link
              to="/"
              className="btn btn-primary"
            >
              Browse Films
            </Link>
          </div>
        ) : (
          profile.reviews.map(
            (review) => (
              <ProfileReview
                key={
                  review._id
                }
                review={
                  review
                }
                displayStars={
                  displayStars
                }
              />
            )
          )
        )}
      </section>


      {/* =====================
          DIRECTOR QUOTE
      ====================== */}

      <DirectorQuote
        director="Christopher Nolan"
        quote="Films are subjective-- what you like, what you don't like."
      />
    </div>
  );
}

export default Profile;