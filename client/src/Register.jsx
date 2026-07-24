import { useState } from "react";

function Register() {

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  function handleChange(event) {

    const { name, value } = event.target;

    setUser({
      ...user,
      [name]: value
    });
  }

  function handleSubmit(event) {

    event.preventDefault();

    console.log("Registration Submitted");
    console.log(user);
  }

  return (
    <div className="row justify-content-center">

      <div className="col-md-6">

        <div className="card">

          <div className="card-body">

            <h2 className="text-center mb-4">
              Register
            </h2>

            <form onSubmit={handleSubmit}>

              <div className="mb-3">

                <label className="form-label">
                  Name
                </label>

                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="mb-3">

                <label className="form-label">
                  Email
                </label>

                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="mb-3">

                <label className="form-label">
                  Password
                </label>

                <input
                  className="form-control"
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  required
                />

              </div>

              <button
                className="btn btn-success w-100"
                type="submit"
              >
                Create Account
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;