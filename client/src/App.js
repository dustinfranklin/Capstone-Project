import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetails from "./pages/MovieDetails";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter>
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={<Login setCurrentUser={setCurrentUser} />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/movies/:id"
           element={<MovieDetails currentUser={currentUser} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;