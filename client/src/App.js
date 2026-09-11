import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetails from "./pages/MovieDetails";

function App() {
  const [currentUser, setCurrentUser] =
    useState(() => {
      const savedUser =
        localStorage.getItem("currentUser");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    });

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("theme") ||
      "light"
    );
  });

  useEffect(() => {
    document.body.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  }

  return (
    <BrowserRouter>
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="container mt-4">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/login"
            element={
              <Login
                setCurrentUser={
                  setCurrentUser
                }
              />
            }
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/movies/:id"
            element={
              <MovieDetails
                currentUser={
                  currentUser
                }
              />
            }
          />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default App;