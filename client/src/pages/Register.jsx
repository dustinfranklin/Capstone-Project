import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DirectorQuote
  from "../components/DirectorQuote";

function Register() {
  const [
    user,
    setUser,
  ] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const [
    message,
    setMessage,
  ] = useState("");

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setUser({
      ...user,
      [name]: value,
    });
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      const response =
        await fetch(
          "http://localhost:4000/api/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                user
              ),
          }
        );

      const data =
        await response.json();

      setMessage(
        data.message
      );

      if (response.ok) {
        setUser({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setMessage(
        "Could not connect to the server"
      );
    }
  }

  return (
    <div className="register-page">
      {/* =====================
          HEADER
      ====================== */}

      <header className="register-hero text-center">
        <span className="register-eyebrow">
          Join the Club
        </span>

        <h1 className="cinematic-heading">
          Register
        </h1>

        <p className="register-subtitle">
          Create your account
          and start building
          your film history.
        </p>
      </header>

      {/* =====================
          REGISTER CARD
      ====================== */}

      <section className="register-card">
        <div className="register-card-heading">
          <span className="register-card-kicker">
            New Member
          </span>

          <h2>
            Create Account
          </h2>

          <p>
            Join Christin
            Nolantino and start
            reviewing films.
          </p>
        </div>

        {message && (
          <div className="alert alert-info text-center">
            {message}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="row g-3">
            <div className="col-md-6">
              <label
                htmlFor="firstName"
                className="form-label register-label"
              >
                First Name
              </label>

              <input
                id="firstName"
                type="text"
                className="form-control"
                name="firstName"
                value={
                  user.firstName
                }
                onChange={
                  handleChange
                }
                placeholder="First name"
                required
              />
            </div>

            <div className="col-md-6">
              <label
                htmlFor="lastName"
                className="form-label register-label"
              >
                Last Name
              </label>

              <input
                id="lastName"
                type="text"
                className="form-control"
                name="lastName"
                value={
                  user.lastName
                }
                onChange={
                  handleChange
                }
                placeholder="Last name"
                required
              />
            </div>

            <div className="col-12">
              <label
                htmlFor="username"
                className="form-label register-label"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                className="form-control"
                name="username"
                value={
                  user.username
                }
                onChange={
                  handleChange
                }
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="col-12">
              <label
                htmlFor="email"
                className="form-label register-label"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                className="form-control"
                name="email"
                value={
                  user.email
                }
                onChange={
                  handleChange
                }
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="col-12">
              <label
                htmlFor="password"
                className="form-label register-label"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                className="form-control"
                name="password"
                value={
                  user.password
                }
                onChange={
                  handleChange
                }
                placeholder="Create a password"
                required
              />
            </div>

            <div className="col-12 mt-4">
              <button
                type="submit"
                className="btn btn-primary w-100 register-submit-button"
              >
                Create Account
              </button>
            </div>
          </div>
        </form>

        <div className="register-login-prompt">
          <span>
            Already a member?
          </span>

          <Link
            to="/login"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* =====================
          DIRECTOR QUOTE
      ====================== */}

      <DirectorQuote
        director="Quentin Tarantino"
        quote="If I've made it a little easier for artists to work in violence, great! I've accomplished something."
      />
    </div>
  );
}

export default Register;