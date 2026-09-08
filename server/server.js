import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const server = express();
const PORT = 4000;

server.use(cors());
server.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

let db;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();

    db = client.db(process.env.DB_NAME);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Test route
server.get("/", (req, res) => {
  res.send("The server is running");
});

// Get all movies with average ratings
server.get("/api/movies", async (req, res) => {
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
                      $size: "$reviews",
                    },
                    0,
                  ],
                },
                {
                  $avg: "$reviews.rating",
                },
                null,
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
    console.error("Movies error:", error);

    res.status(500).json({
      message: "Could not retrieve movies",
    });
  }
});

// Get one movie by ID
server.get("/api/movies/:id", async (req, res) => {
  try {
    const movieId = req.params.id;

    if (!ObjectId.isValid(movieId)) {
      return res.status(400).json({
        message: "Invalid movie ID",
      });
    }

    const movie = await db
      .collection("movies")
      .findOne({
        _id: new ObjectId(movieId),
      });

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.json(movie);
  } catch (error) {
    console.error("Movie details error:", error);

    res.status(500).json({
      message: "Could not retrieve movie",
    });
  }
});

// Get reviews for one movie
server.get(
  "/api/movies/:id/reviews",
  async (req, res) => {
    try {
      const movieId = req.params.id;

      if (!ObjectId.isValid(movieId)) {
        return res.status(400).json({
          message: "Invalid movie ID",
        });
      }

      const reviews = await db
        .collection("reviews")
        .aggregate([
          {
            $match: {
              movieId: new ObjectId(movieId),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              rating: 1,
              review: 1,
              reviewDate: 1,
              userId: 1,
              userName: "$user.username",
            },
          },
        ])
        .toArray();

      res.json(reviews);
    } catch (error) {
      console.error("Reviews error:", error);

      res.status(500).json({
        message: "Could not retrieve reviews",
      });
    }
  }
);

// Submit a new review
server.post(
  "/api/movies/:id/reviews",
  async (req, res) => {
    try {
      const movieId = req.params.id;

      const {
        userId,
        rating,
        review,
      } = req.body;

      if (
        !userId ||
        !rating ||
        !review
      ) {
        return res.status(400).json({
          message:
            "User, rating, and review are required",
        });
      }

      if (
        !ObjectId.isValid(movieId) ||
        !ObjectId.isValid(userId)
      ) {
        return res.status(400).json({
          message: "Invalid ID",
        });
      }

      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5",
        });
      }

      const existingReview = await db
        .collection("reviews")
        .findOne({
          userId: new ObjectId(userId),
          movieId: new ObjectId(movieId),
        });

      if (existingReview) {
        return res.status(409).json({
          message:
            "You have already reviewed this movie. Edit your existing review instead.",
        });
      }

      const newReview = {
        userId: new ObjectId(userId),
        movieId: new ObjectId(movieId),
        rating: numericRating,
        review,
        reviewDate: new Date()
          .toISOString()
          .split("T")[0],
      };

      const result = await db
        .collection("reviews")
        .insertOne(newReview);

      res.status(201).json({
        message:
          "Review submitted successfully",
        reviewId: result.insertedId,
      });
    } catch (error) {
      console.error(
        "Submit review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not submit review",
      });
    }
  }
);

// Update a review
server.put(
  "/api/reviews/:id",
  async (req, res) => {
    try {
      const reviewId = req.params.id;

      const {
        userId,
        rating,
        review,
      } = req.body;

      if (
        !userId ||
        !rating ||
        !review
      ) {
        return res.status(400).json({
          message:
            "User, rating, and review are required",
        });
      }

      if (
        !ObjectId.isValid(reviewId) ||
        !ObjectId.isValid(userId)
      ) {
        return res.status(400).json({
          message: "Invalid ID",
        });
      }

      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be between 1 and 5",
        });
      }

      const existingReview = await db
        .collection("reviews")
        .findOne({
          _id: new ObjectId(reviewId),
        });

      if (!existingReview) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      if (
        existingReview.userId.toString() !==
        userId
      ) {
        return res.status(403).json({
          message:
            "You can only edit your own reviews",
        });
      }

      await db
        .collection("reviews")
        .updateOne(
          {
            _id: new ObjectId(reviewId),
          },
          {
            $set: {
              rating: numericRating,
              review,
            },
          }
        );

      res.json({
        message:
          "Review updated successfully",
      });
    } catch (error) {
      console.error(
        "Update review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not update review",
      });
    }
  }
);

// Delete a review
server.delete(
  "/api/reviews/:id",
  async (req, res) => {
    try {
      const reviewId = req.params.id;

      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          message: "User is required",
        });
      }

      if (
        !ObjectId.isValid(reviewId) ||
        !ObjectId.isValid(userId)
      ) {
        return res.status(400).json({
          message: "Invalid ID",
        });
      }

      const existingReview = await db
        .collection("reviews")
        .findOne({
          _id: new ObjectId(reviewId),
        });

      if (!existingReview) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      if (
        existingReview.userId.toString() !==
        userId
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own reviews",
        });
      }

      await db
        .collection("reviews")
        .deleteOne({
          _id: new ObjectId(reviewId),
        });

      res.json({
        message:
          "Review deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      res.status(500).json({
        message:
          "Could not delete review",
      });
    }
  }
);

// Register a new user
server.post(
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
            "First name, last name, username, email, and password are required",
        });
      }

      const usersCollection =
        db.collection("users");

      const existingEmail =
        await usersCollection.findOne({
          email,
        });

      if (existingEmail) {
        return res.status(409).json({
          message:
            "A user with that email already exists",
        });
      }

      const existingUsername =
        await usersCollection.findOne({
          username,
        });

      if (existingUsername) {
        return res.status(409).json({
          message:
            "That username is already taken",
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
        password: hashedPassword,
        createdAt: new Date(),
      };

      const result =
        await usersCollection.insertOne(
          newUser
        );

      res.status(201).json({
        message:
          "Registration successful",
        userId: result.insertedId,
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      res.status(500).json({
        message:
          "Could not register user",
      });
    }
  }
);

// Log in a user
server.post(
  "/api/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Email and password are required",
        });
      }

      const usersCollection =
        db.collection("users");

      const user =
        await usersCollection.findOne({
          email,
        });

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password",
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
            "Invalid email or password",
        });
      }

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
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
          "Could not log in",
      });
    }
  }
);

// Connect to MongoDB, then start server
connectToDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        `The server is running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "Server could not start because MongoDB connection failed:",
      error
    );
  });