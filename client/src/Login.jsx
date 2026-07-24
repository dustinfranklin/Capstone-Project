import { useState } from "react";

function Login() {

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  function handleChange(event) {

    const { name, value } = event.target;

    setLoginData({
      ...loginData,
      [name]: value
    });
  }

  function handleSubmit(event) {

    event.preventDefault();

    console.log("Login Submitted");
    console.log(loginData);
  }

  return (
    <div className="row justify-content-center">

      <div className="col-md-6">

        <div className="card">

          <div className="card-body">

            <h2 className="text-center mb-4">
              Login
            </h2>

            <form onSubmit={handleSubmit}>

              <div className="mb-3">

                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="mb-3">

                <label className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                />

              </div>

              <button
                className="btn btn-primary w-100"
                type="submit"
              >
                Login
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;