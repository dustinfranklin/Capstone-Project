import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import DirectorQuote
  from "../components/DirectorQuote";

function Login({
  setCurrentUser,
}) {
  const [
    loginData,
    setLoginData,
  ] = useState({
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

    setLoginData({
      ...loginData,
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
          "http://localhost:4000/api/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                loginData
              ),
          }
        );

      const data =
        await response.json();

      setMessage(
        data.message
      );

      if (response.ok) {
        setCurrentUser(
          data.user
        );

        localStorage.setItem(
          "currentUser",
          JSON.stringify(
            data.user
          )
        );
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setMessage(
        "Could not connect to the server"
      );
    }
  }

  return (
    <div className="login-page">
      {/* =====================
          HEADER
      ====================== */}

      <header className="login-hero text-center">
        <span className="login-eyebrow">
          Welcome Back
        </span>

        <h1 className="cinematic-heading">
          Login
        </h1>

        <p className="login-subtitle">
          Step back into the
          Christin Nolantino
          film club.
        </p>
      </header>

      {/* =====================
          LOGIN CARD
      ====================== */}

      <section className="login-card">
        <div className="login-card-heading">
          <span className="login-card-kicker">
            Member Access
          </span>

          <h2>
            Sign In
          </h2>

          <p>
            Enter your account
            details to continue.
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
          <div className="mb-3">
            <label
              htmlFor="email"
              className="form-label login-label"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              name="email"
              value={
                loginData.email
              }
              onChange={
                handleChange
              }
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="form-label login-label"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              name="password"
              value={
                loginData.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 login-submit-button"
          >
            Login
          </button>
        </form>

        <div className="login-register-prompt">
          <span>
            New to the club?
          </span>

          <Link
            to="/register"
          >
            Create an account
          </Link>
        </div>
      </section>

      {/* =====================
          DIRECTOR QUOTE
      ====================== */}

      <DirectorQuote
        director="Quentin Tarantino"
        quote="Violent films don't turn children into violent people. They may turn them into violent filmmakers, but that's another matter altogether."
      />
    </div>
  );
}

export default Login;