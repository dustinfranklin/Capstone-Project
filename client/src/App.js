import {
  useEffect,
  useState,
} from "react";

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
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  const [
    theme,
    setTheme,
  ] = useState(() => {
    return (
      localStorage.getItem(
        "theme"
      ) || "light"
    );
  });

  const [
    currentUser,
    setCurrentUser,
  ] = useState(() => {
    const savedUser =
      localStorage.getItem(
        "currentUser"
      );

    return savedUser
      ? JSON.parse(
          savedUser
        )
      : null;
  });

  useEffect(() => {
    document.body.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "theme",
      theme
    );
  }, [theme]);

  function toggleTheme() {
    setTheme(
      (currentTheme) =>
        currentTheme ===
        "light"
          ? "dark"
          : "light"
    );
  }

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar
          theme={theme}
          setTheme={
            setTheme
          }
          toggleTheme={
            toggleTheme
          }
          currentUser={
            currentUser
          }
          setCurrentUser={
            setCurrentUser
          }
        />

        <main className="container py-4 flex-grow-1">
          <Routes>
            {/* HOME */}

            <Route
              path="/"
              element={
                <Home />
              }
            />

            {/* ABOUT */}

            <Route
              path="/about"
              element={
                <About />
              }
            />

            {/* LOGIN */}

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

            {/* REGISTER */}

            <Route
              path="/register"
              element={
                <Register />
              }
            />

            {/* MOVIE DETAILS */}

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

            {/* WATCHLIST */}

            <Route
              path="/watchlist"
              element={
                <Watchlist
                  currentUser={
                    currentUser
                  }
                />
              }
            />

            {/* PROFILE */}

            <Route
              path="/profile"
              element={
                <Profile
                  currentUser={
                    currentUser
                  }
                  setCurrentUser={
                    setCurrentUser
                  }
                />
              }
            />

            {/* 404 */}

            <Route
              path="*"
              element={
                <NotFound
                  currentUser={
                    currentUser
                  }
                />
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;