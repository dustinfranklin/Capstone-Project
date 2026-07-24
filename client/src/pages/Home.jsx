function Home() {
  return (
    <div>

      <div className="p-5 mb-4 bg-dark text-white rounded-3">

        <div className="container-fluid py-5">

          <h1 className="display-4 fw-bold">
            Welcome to Movie Review Club
          </h1>

          <p className="fs-5">
            Share your thoughts, rate movies, and discuss your
            favorite films with other movie fans.
          </p>

          <button className="btn btn-primary btn-lg">
            Browse Reviews
          </button>

        </div>

      </div>


      <div className="row text-center">

        <div className="col-md-4">

          <div className="card shadow">

            <div className="card-body">

              <h3>🎥 Reviews</h3>

              <p>
                Read reviews from other movie lovers.
              </p>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card shadow">

            <div className="card-body">

              <h3>⭐ Ratings</h3>

              <p>
                Rate movies and share your opinions.
              </p>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card shadow">

            <div className="card-body">

              <h3>👥 Community</h3>

              <p>
                Join discussions with other members.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;