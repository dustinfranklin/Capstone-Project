import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import {
  MongoClient,
  ObjectId,
} from "mongodb";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(
  process.env.MONGODB_URI
);

let db;

// =========================
// BASIC TEST ROUTE
// =========================

app.get("/", (req, res) => {
  res.send("Server is running");
});

// =========================
// SEARCH MOVIES BY ACTOR
// =========================

app.get(
  "/api/movies/search-by-actor",
  async (req, res) => {
    try {
      const actorName =
        req.query.name?.trim();

      if (!actorName) {
        return res.status(400).json({
          message:
            "Please enter an actor name.",
        });
      }

      // Search TMDB for the actor
      const personResponse = await fetch(
        `https://api.themoviedb.org/3/search/person?api_key=${
          process.env.TMDB_API_KEY
        }&query=${encodeURIComponent(
          actorName
        )}`
      );

      const personData =
        await personResponse.json();

      if (!personResponse.ok) {
        return res
          .status(personResponse.status)
          .json({
            message:
              "Could not search TMDB.",
            error: personData,
          });
      }

      if (
        !personData.results ||
        personData.results.length === 0
      ) {
        return res.json({
          actor: actorName,
          movies: [],
          message:
            "Sorry! They're not in these movies!",
        });
      }

      // Prefer exact name match
      const exactMatch =
        personData.results.find(
          (person) =>
            person.name
              ?.trim()
              .toLowerCase() ===
            actorName
              .trim()
              .toLowerCase()
        );

      const actor =
        exactMatch ||
        personData.results[0];

      // Get the actor's movie credits
      const creditsResponse =
        await fetch(
          `https://api.themoviedb.org/3/person/${actor.id}/movie_credits?api_key=${process.env.TMDB_API_KEY}`
        );

      const creditsData =
        await creditsResponse.json();

      if (!creditsResponse.ok) {
        return res
          .status(
            creditsResponse.status
          )
          .json({
            message:
              "Could not get actor movie credits.",
            error: creditsData,
          });
      }

      // Create a list of TMDB movie IDs
      // the actor appeared in
      const actorMovieIds =
        new Set(
          (creditsData.cast || []).map(
            (credit) => credit.id
          )
        );

      // Get our movies, including ratings
      const ourMovies = await db
        .collection("movies")
        .aggregate([
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "movieId",
              as: "reviews",
            },
          },
          {
            $addFields: {
              averageRating: {
                $cond: [
                  {
                    $gt: [
                      {
                        $size:
                          "$reviews",
                      },
                      0,
                    ],
                  },
                  {
                    $avg:
                      "$reviews.rating",
                  },
                  0,
                ],
              },
              reviewCount: {
                $size: "$reviews",
              },
            },
          },
          {
            $project: {
              reviews: 0,
            },
          },
        ])
        .toArray();

      // Compare TMDB IDs directly
      const matchingMovies =
        ourMovies.filter(
          (movie) =>
            movie.tmdbId &&
            actorMovieIds.has(
              Number(movie.tmdbId)
            )
        );

      if (
        matchingMovies.length === 0
      ) {
        return res.json({
          actor: actor.name,
          movies: [],
          message:
            "Sorry! They're not in these movies!",
        });
      }

      res.json({
        actor: actor.name,
        movies: matchingMovies,
      });
    } catch (error) {
      console.error(
        "Actor search error:",
        error
      );

      res.status(500).json({
        message:
          "Could not search movies by actor.",
      });
    }
  }
);
// =========================
// GET ALL MOVIES
// =========================

app.get("/api/movies", async (req, res) => {
  try {
    const movies = await db
      .collection("movies")
      .aggregate([
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "movieId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: [
                {
                  $gt: [
                    {
                      $size:
                        "$reviews",
                    },
                    0,
                  ],
                },
                {
                  $avg:
                    "$reviews.rating",
                },
                0,
              ],
            },
            reviewCount: {
              $size: "$reviews",
            },
          },
        },
        {
          $project: {
            reviews: 0,
          },
        },
      ])
      .toArray();

    res.json(movies);
  } catch (error) {
    console.error(
      "Get movies error:",
      error
    );

    res.status(500).json({
      message:
        "Could not get movies.",
    });
  }
});

// =========================
// GET ONE MOVIE
// =========================

app.get(
  "/api/movies/:id",
  async (req, res) => {
    try {
      if (
        !ObjectId.isValid(req.params.id)
      ) {
        return res.status(400).json({
          message:
            "Invalid movie ID.",
        });
      }

      const movie = await db
        .collection("movies")
        .findOne({
          _id: new ObjectId(
            req.params.id
          ),
        });

      if (!movie) {
        return res.status(404).json({
          message:
            "Movie not found.",
        });
      }

      res.json(movie);
    } catch (error) {
      console.error(
        "Get movie error:",
        error
      );

      res.status(500).json({
        message:
          "Could not get movie.",
      });
    }
  }
);

// =========================
// GET REVIEWS FOR A MOVIE
// =========================

app.get(
  "/api/movies/:id/reviews",
  async (req, res) => {
    try {
      if (
        !ObjectId.isValid(req.params.id)
      ) {
        return res.status(400).json({
          message:
            "Invalid movie ID.",
        });
      }

      const reviews = await db
        .collection("reviews")
        .aggregate([
          {
            $match: {
              movieId:
                new ObjectId(
                  req.params.id
                ),
            },
          },
          {
            $lookup: {
              from: "users",
              localField:
                "userId",
              foreignField:
                "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays:
                true,
            },
          },
          {
            $project: {
              userId: 1,
              movieId: 1,
              rating: 1,
              review: 1,
              reviewDate: 1,
              userName:
                "$user.username",
            },
          },
          {
            $sort: {
              reviewDate: -1,
            },
          },
        ])
        .toArray();

      res.json(reviews);
    } catch (error) {
      console.error(
        "Get reviews error:",
        error
      );

      res.status(500).json({
        message:
          "Could not get reviews.",
      });
    }
  }
);

// =========================
// CREATE REVIEW
// =========================

app.post(
  "/api/movies/:id/reviews",
  async (req, res) => {
    try {
      const {
        userId,
        rating,
        review,
      } = req.body;

      if (
        !ObjectId.isValid(
          req.params.id
        ) ||
        !ObjectId.isValid(userId)
      ) {
        return res.status(400).json({
          message:
            "Invalid movie or user ID.",
        });
      }

      const numericRating =
        Number(rating);

      if (
        !numericRating ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5.",
        });
      }

      const movieId =
        new ObjectId(
          req.params.id
        );

      const userObjectId =
        new ObjectId(userId);

      const existingReview =
        await db
          .collection("reviews")
          .findOne({
            movieId,
            userId: userObjectId,
          });

      if (existingReview) {
        return res.status(400).json({
          message:
            "You have already reviewed this movie.",
        });
      }

      const newReview = {
        userId: userObjectId,
        movieId,
        rating: numericRating,
        review:
          review?.trim() || "",
        reviewDate: new Date(),
      };

      const result = await db
        .collection("reviews")
        .insertOne(newReview);

      res.status(201).json({
        message:
          "Review added successfully.",
        review: {
          _id: result.insertedId,
          ...newReview,
        },
      });
    } catch (error) {
      console.error(
        "Create review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not create review.",
      });
    }
  }
);

// =========================
// UPDATE REVIEW
// =========================

app.put(
  "/api/reviews/:id",
  async (req, res) => {
    try {
      const {
        userId,
        rating,
        review,
      } = req.body;

      if (
        !ObjectId.isValid(
          req.params.id
        ) ||
        !ObjectId.isValid(userId)
      ) {
        return res.status(400).json({
          message:
            "Invalid review or user ID.",
        });
      }

      const numericRating =
        Number(rating);

      if (
        !numericRating ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5.",
        });
      }

      const result = await db
        .collection("reviews")
        .updateOne(
          {
            _id: new ObjectId(
              req.params.id
            ),
            userId: new ObjectId(
              userId
            ),
          },
          {
            $set: {
              rating:
                numericRating,
              review:
                review?.trim() ||
                "",
            },
          }
        );

      if (
        result.matchedCount === 0
      ) {
        return res.status(403).json({
          message:
            "You cannot edit this review.",
        });
      }

      res.json({
        message:
          "Review updated successfully.",
      });
    } catch (error) {
      console.error(
        "Update review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not update review.",
      });
    }
  }
);

// =========================
// DELETE REVIEW
// =========================

app.delete(
  "/api/reviews/:id",
  async (req, res) => {
    try {
      const { userId } =
        req.body;

      if (
        !ObjectId.isValid(
          req.params.id
        ) ||
        !ObjectId.isValid(userId)
      ) {
        return res.status(400).json({
          message:
            "Invalid review or user ID.",
        });
      }

      const result = await db
        .collection("reviews")
        .deleteOne({
          _id: new ObjectId(
            req.params.id
          ),
          userId: new ObjectId(
            userId
          ),
        });

      if (
        result.deletedCount === 0
      ) {
        return res.status(403).json({
          message:
            "You cannot delete this review.",
        });
      }

      res.json({
        message:
          "Review deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not delete review.",
      });
    }
  }
);

// =========================
// REGISTER
// =========================

app.post(
  "/api/register",
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        password,
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !username ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Please complete all fields.",
        });
      }

      const users =
        db.collection("users");

      const existingEmail =
        await users.findOne({
          email,
        });

      if (existingEmail) {
        return res.status(400).json({
          message:
            "An account with that email already exists.",
        });
      }

      const existingUsername =
        await users.findOne({
          username,
        });

      if (existingUsername) {
        return res.status(400).json({
          message:
            "That username is already taken.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const newUser = {
        firstName,
        lastName,
        username,
        email,
        password:
          hashedPassword,
      };

      const result =
        await users.insertOne(
          newUser
        );

      res.status(201).json({
        message:
          "Registration successful.",
        userId:
          result.insertedId,
      });
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      res.status(500).json({
        message:
          "Could not register user.",
      });
    }
  }
);

// =========================
// LOGIN
// =========================

app.post(
  "/api/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Please enter your email and password.",
        });
      }

      const user = await db
        .collection("users")
        .findOne({
          email,
        });

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatches) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      res.json({
        message:
          "Login successful.",
        user: {
          id: user._id,
          firstName:
            user.firstName,
          lastName:
            user.lastName,
          username:
            user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      res.status(500).json({
        message:
          "Could not log in.",
      });
    }
  }
);

// =========================
// CONNECT TO MONGODB
// =========================

async function startServer() {
  try {
    await client.connect();

    db = client.db(
      process.env.DB_NAME
    );

    console.log(
      `Connected to MongoDB database: ${process.env.DB_NAME}`
    );

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error
    );
  }
}

startServer();