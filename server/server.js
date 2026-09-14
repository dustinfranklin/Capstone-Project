import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  MongoClient,
  ObjectId,
} from "mongodb";


dotenv.config();


/* =========================
   BASIC SETUP
========================= */

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const uploadsDirectory =
  path.join(
    __dirname,
    "uploads"
  );

if (
  !fs.existsSync(
    uploadsDirectory
  )
) {
  fs.mkdirSync(
    uploadsDirectory
  );
}


const app = express();

const PORT =
  process.env.PORT || 4000;


app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    uploadsDirectory
  )
);


/* =========================
   PROFILE PICTURE UPLOAD
========================= */

const profilePictureStorage =
  multer.diskStorage({
    destination: (
      req,
      file,
      callback
    ) => {
      callback(
        null,
        uploadsDirectory
      );
    },

    filename: (
      req,
      file,
      callback
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const uniqueName =
        `profile-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      callback(
        null,
        uniqueName
      );
    },
  });


const profilePictureUpload =
  multer({
    storage:
      profilePictureStorage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        allowedTypes.includes(
          file.mimetype
        )
      ) {
        callback(
          null,
          true
        );
      } else {
        callback(
          new Error(
            "Only JPG, PNG, and WEBP images are allowed."
          )
        );
      }
    },
  });


/* =========================
   MONGODB
========================= */

const client =
  new MongoClient(
    process.env.MONGODB_URI
  );

let db;


/* =========================
   HELPER FUNCTIONS
========================= */

function validId(id) {
  return ObjectId.isValid(
    id
  );
}


function movieReviewStatsPipeline(
  matchStage = null
) {
  const pipeline = [];

  if (matchStage) {
    pipeline.push({
      $match: matchStage,
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField:
          "movieId",
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
          $size:
            "$reviews",
        },
      },
    },

    {
      $project: {
        reviews: 0,
      },
    }
  );

  return pipeline;
}


async function getMoviesWithStats(
  matchStage = null
) {
  return db
    .collection("movies")
    .aggregate(
      movieReviewStatsPipeline(
        matchStage
      )
    )
    .toArray();
}


/* =========================
   BASIC TEST ROUTE
========================= */

app.get(
  "/",
  (req, res) => {
    res.send(
      "Server is running"
    );
  }
);


/* =========================
   SEARCH MOVIES BY ACTOR
========================= */

app.get(
  "/api/movies/search-by-actor",
  async (req, res) => {
    try {
      const actorName =
        req.query.name?.trim();

      if (!actorName) {
        return res
          .status(400)
          .json({
            message:
              "Please enter an actor name.",
          });
      }


      const personResponse =
        await fetch(
          `https://api.themoviedb.org/3/search/person?api_key=${
            process.env.TMDB_API_KEY
          }&query=${encodeURIComponent(
            actorName
          )}`
        );

      const personData =
        await personResponse.json();


      if (
        !personResponse.ok
      ) {
        return res
          .status(
            personResponse.status
          )
          .json({
            message:
              "Could not search TMDB.",

            error:
              personData,
          });
      }


      if (
        !personData.results ||
        personData.results
          .length === 0
      ) {
        return res.json({
          actor:
            actorName,

          movies: [],

          message:
            "Sorry! They're not in these movies!",
        });
      }


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


      const creditsResponse =
        await fetch(
          `https://api.themoviedb.org/3/person/${actor.id}/movie_credits?api_key=${process.env.TMDB_API_KEY}`
        );

      const creditsData =
        await creditsResponse.json();


      if (
        !creditsResponse.ok
      ) {
        return res
          .status(
            creditsResponse.status
          )
          .json({
            message:
              "Could not get actor movie credits.",

            error:
              creditsData,
          });
      }


      const actorMovieIds =
        new Set(
          (
            creditsData.cast ||
            []
          ).map(
            (credit) =>
              credit.id
          )
        );


      const ourMovies =
        await getMoviesWithStats();


      const matchingMovies =
        ourMovies.filter(
          (movie) =>
            movie.tmdbId &&
            actorMovieIds.has(
              Number(
                movie.tmdbId
              )
            )
        );


      if (
        matchingMovies.length ===
        0
      ) {
        return res.json({
          actor:
            actor.name,

          movies: [],

          message:
            "Sorry! They're not in these movies!",
        });
      }


      res.json({
        actor:
          actor.name,

        movies:
          matchingMovies,
      });
    } catch (error) {
      console.error(
        "Actor search error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not search movies by actor.",
        });
    }
  }
);


/* =========================
   GET ALL MOVIES
========================= */

app.get(
  "/api/movies",
  async (req, res) => {
    try {
      const movies =
        await getMoviesWithStats();

      res.json(
        movies
      );
    } catch (error) {
      console.error(
        "Get movies error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not get movies.",
        });
    }
  }
);


/* =========================
   GET ONE MOVIE
========================= */

app.get(
  "/api/movies/:id",
  async (req, res) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid movie ID.",
          });
      }


      const movie =
        await db
          .collection("movies")
          .findOne({
            _id:
              new ObjectId(
                req.params.id
              ),
          });


      if (!movie) {
        return res
          .status(404)
          .json({
            message:
              "Movie not found.",
          });
      }


      res.json(
        movie
      );
    } catch (error) {
      console.error(
        "Get movie error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not get movie.",
        });
    }
  }
);


/* =========================
   GET REVIEWS FOR A MOVIE
========================= */

app.get(
  "/api/movies/:id/reviews",
  async (req, res) => {
    try {
      if (
        !validId(
          req.params.id
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid movie ID.",
          });
      }


      const reviews =
        await db
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


      res.json(
        reviews
      );
    } catch (error) {
      console.error(
        "Get reviews error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not get reviews.",
        });
    }
  }
);


/* =========================
   CREATE REVIEW
========================= */

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
        !validId(
          req.params.id
        ) ||
        !validId(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid movie or user ID.",
          });
      }


      const numericRating =
        Number(
          rating
        );


      if (
        !numericRating ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res
          .status(400)
          .json({
            message:
              "Rating must be between 1 and 5.",
          });
      }


      const movieId =
        new ObjectId(
          req.params.id
        );

      const userObjectId =
        new ObjectId(
          userId
        );


      const existingReview =
        await db
          .collection("reviews")
          .findOne({
            movieId,
            userId:
              userObjectId,
          });


      if (
        existingReview
      ) {
        return res
          .status(400)
          .json({
            message:
              "You have already reviewed this movie.",
          });
      }


      const newReview = {
        userId:
          userObjectId,

        movieId,

        rating:
          numericRating,

        review:
          review?.trim() ||
          "",

        reviewDate:
          new Date(),
      };


      const result =
        await db
          .collection("reviews")
          .insertOne(
            newReview
          );


      res
        .status(201)
        .json({
          message:
            "Review added successfully.",

          review: {
            _id:
              result.insertedId,

            ...newReview,
          },
        });
    } catch (error) {
      console.error(
        "Create review error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not create review.",
        });
    }
  }
);


/* =========================
   UPDATE REVIEW
========================= */

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
        !validId(
          req.params.id
        ) ||
        !validId(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid review or user ID.",
          });
      }


      const numericRating =
        Number(
          rating
        );


      if (
        !numericRating ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res
          .status(400)
          .json({
            message:
              "Rating must be between 1 and 5.",
          });
      }


      const result =
        await db
          .collection("reviews")
          .updateOne(
            {
              _id:
                new ObjectId(
                  req.params.id
                ),

              userId:
                new ObjectId(
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
        result.matchedCount ===
        0
      ) {
        return res
          .status(403)
          .json({
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

      res
        .status(500)
        .json({
          message:
            "Could not update review.",
        });
    }
  }
);


/* =========================
   DELETE REVIEW
========================= */

app.delete(
  "/api/reviews/:id",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.body;


      if (
        !validId(
          req.params.id
        ) ||
        !validId(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid review or user ID.",
          });
      }


      const result =
        await db
          .collection("reviews")
          .deleteOne({
            _id:
              new ObjectId(
                req.params.id
              ),

            userId:
              new ObjectId(
                userId
              ),
          });


      if (
        result.deletedCount ===
        0
      ) {
        return res
          .status(403)
          .json({
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

      res
        .status(500)
        .json({
          message:
            "Could not delete review.",
        });
    }
  }
);


/* =========================
   WATCHLIST
   GET USER FAVORITES
========================= */

app.get(
  "/api/users/:userId/favorites",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;


      if (
        !validId(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid user ID.",
          });
      }


      const userObjectId =
        new ObjectId(
          userId
        );


      const user =
        await db
          .collection("users")
          .findOne({
            _id:
              userObjectId,
          });


      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found.",
          });
      }


      const favoriteIds =
        user.favorites ||
        [];


      if (
        favoriteIds.length ===
        0
      ) {
        return res.json(
          []
        );
      }


      const favorites =
        await getMoviesWithStats({
          _id: {
            $in:
              favoriteIds,
          },
        });


      res.json(
        favorites
      );
    } catch (error) {
      console.error(
        "Get favorites error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not get favorites.",
        });
    }
  }
);


/* =========================
   ADD MOVIE TO WATCHLIST
========================= */

app.post(
  "/api/users/:userId/favorites/:movieId",
  async (req, res) => {
    try {
      const {
        userId,
        movieId,
      } = req.params;


      if (
        !validId(
          userId
        ) ||
        !validId(
          movieId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid user or movie ID.",
          });
      }


      const userObjectId =
        new ObjectId(
          userId
        );

      const movieObjectId =
        new ObjectId(
          movieId
        );


      const user =
        await db
          .collection("users")
          .findOne({
            _id:
              userObjectId,
          });


      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found.",
          });
      }


      const movie =
        await db
          .collection("movies")
          .findOne({
            _id:
              movieObjectId,
          });


      if (!movie) {
        return res
          .status(404)
          .json({
            message:
              "Movie not found.",
          });
      }


      await db
        .collection("users")
        .updateOne(
          {
            _id:
              userObjectId,
          },

          {
            $addToSet: {
              favorites:
                movieObjectId,
            },
          }
        );


      res
        .status(201)
        .json({
          message:
            "Movie added to watchlist.",
        });
    } catch (error) {
      console.error(
        "Add favorite error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not add movie to watchlist.",
        });
    }
  }
);


/* =========================
   REMOVE MOVIE FROM WATCHLIST
========================= */

app.delete(
  "/api/users/:userId/favorites/:movieId",
  async (req, res) => {
    try {
      const {
        userId,
        movieId,
      } = req.params;


      if (
        !validId(
          userId
        ) ||
        !validId(
          movieId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid user or movie ID.",
          });
      }


      const userObjectId =
        new ObjectId(
          userId
        );

      const movieObjectId =
        new ObjectId(
          movieId
        );


      const user =
        await db
          .collection("users")
          .findOne({
            _id:
              userObjectId,
          });


      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found.",
          });
      }


      await db
        .collection("users")
        .updateOne(
          {
            _id:
              userObjectId,
          },

          {
            $pull: {
              favorites:
                movieObjectId,
            },
          }
        );


      res.json({
        message:
          "Movie removed from watchlist.",
      });
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not remove movie from watchlist.",
        });
    }
  }
);


/* =========================
   UPLOAD PROFILE PICTURE
========================= */

app.post(
  "/api/users/:userId/profile-picture",

  profilePictureUpload.single(
    "profilePicture"
  ),

  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;


      if (
        !validId(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid user ID.",
          });
      }


      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "Please choose an image.",
          });
      }


      const userObjectId =
        new ObjectId(
          userId
        );


      const profilePic =
        `http://localhost:${PORT}/uploads/${req.file.filename}`;


      const result =
        await db
          .collection("users")
          .findOneAndUpdate(
            {
              _id:
                userObjectId,
            },

            {
              $set: {
                profilePic,
              },
            },

            {
              returnDocument:
                "after",

              projection: {
                password: 0,
              },
            }
          );


      if (!result) {
        return res
          .status(404)
          .json({
            message:
              "User not found.",
          });
      }


      res.json({
        message:
          "Profile picture updated successfully.",

        profilePic:
          result.profilePic,
      });
    } catch (error) {
      console.error(
        "Profile picture upload error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not upload profile picture.",
        });
    }
  }
);


/* =========================
   GET USER PROFILE
========================= */

app.get(
  "/api/users/:userId/profile",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;


      if (
        !validId(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid user ID.",
          });
      }


      const userObjectId =
        new ObjectId(
          userId
        );


      const user =
        await db
          .collection("users")
          .findOne(
            {
              _id:
                userObjectId,
            },

            {
              projection: {
                password: 0,
              },
            }
          );


      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found.",
          });
      }


      const reviews =
        await db
          .collection("reviews")
          .aggregate([
            {
              $match: {
                userId:
                  userObjectId,
              },
            },

            {
              $lookup: {
                from: "movies",

                localField:
                  "movieId",

                foreignField:
                  "_id",

                as: "movie",
              },
            },

            {
              $unwind: {
                path: "$movie",

                preserveNullAndEmptyArrays:
                  true,
              },
            },

            {
              $project: {
                _id: 1,
                movieId: 1,
                rating: 1,
                review: 1,
                reviewDate: 1,

                movieTitle:
                  "$movie.title",

                moviePoster:
                  "$movie.poster",

                movieDirector:
                  "$movie.director",
              },
            },

            {
              $sort: {
                reviewDate: -1,
              },
            },
          ])
          .toArray();


      const reviewCount =
        reviews.length;


      const averageRating =
        reviewCount > 0
          ? reviews.reduce(
              (
                total,
                review
              ) =>
                total +
                Number(
                  review.rating
                ),
              0
            ) /
            reviewCount
          : 0;


      const watchlistCount =
        Array.isArray(
          user.favorites
        )
          ? user.favorites.length
          : 0;


      res.json({
        user: {
          id:
            user._id,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          username:
            user.username,

          email:
            user.email,

          profilePic:
            user.profilePic ||
            "",

          bio:
            user.bio ||
            "",
        },

        stats: {
          reviewCount,
          averageRating,
          watchlistCount,
        },

        reviews,
      });
    } catch (error) {
      console.error(
        "Get profile error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not get user profile.",
        });
    }
  }
);


/* =========================
   UPDATE USER PROFILE
========================= */

app.put(
  "/api/users/:userId/profile",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;


      if (
        !validId(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid user ID.",
          });
      }


      const {
        firstName,
        lastName,
        bio,
      } = req.body;


      const cleanFirstName =
        firstName?.trim();

      const cleanLastName =
        lastName?.trim();

      const cleanBio =
        bio?.trim() ||
        "";


      if (
        !cleanFirstName ||
        !cleanLastName
      ) {
        return res
          .status(400)
          .json({
            message:
              "First name and last name are required.",
          });
      }


      if (
        cleanBio.length >
        300
      ) {
        return res
          .status(400)
          .json({
            message:
              "Bio must be 300 characters or fewer.",
          });
      }


      const result =
        await db
          .collection("users")
          .findOneAndUpdate(
            {
              _id:
                new ObjectId(
                  userId
                ),
            },

            {
              $set: {
                firstName:
                  cleanFirstName,

                lastName:
                  cleanLastName,

                bio:
                  cleanBio,
              },
            },

            {
              returnDocument:
                "after",

              projection: {
                password: 0,
              },
            }
          );


      if (!result) {
        return res
          .status(404)
          .json({
            message:
              "User not found.",
          });
      }


      res.json({
        message:
          "Profile updated successfully.",

        user: {
          id:
            result._id,

          firstName:
            result.firstName,

          lastName:
            result.lastName,

          username:
            result.username,

          email:
            result.email,

          profilePic:
            result.profilePic ||
            "",

          bio:
            result.bio ||
            "",
        },
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not update user profile.",
        });
    }
  }
);


/* =========================
   REGISTER
========================= */

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
        return res
          .status(400)
          .json({
            message:
              "Please complete all fields.",
          });
      }


      const users =
        db.collection(
          "users"
        );


      const existingEmail =
        await users.findOne({
          email,
        });


      if (
        existingEmail
      ) {
        return res
          .status(400)
          .json({
            message:
              "An account with that email already exists.",
          });
      }


      const existingUsername =
        await users.findOne({
          username,
        });


      if (
        existingUsername
      ) {
        return res
          .status(400)
          .json({
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

        favorites: [],
        profilePic: "",
        bio: "",
      };


      const result =
        await users.insertOne(
          newUser
        );


      res
        .status(201)
        .json({
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

      res
        .status(500)
        .json({
          message:
            "Could not register user.",
        });
    }
  }
);


/* =========================
   LOGIN
========================= */

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
        return res
          .status(400)
          .json({
            message:
              "Please enter your email and password.",
          });
      }


      const user =
        await db
          .collection("users")
          .findOne({
            email,
          });


      if (!user) {
        return res
          .status(401)
          .json({
            message:
              "Invalid email or password.",
          });
      }


      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );


      if (
        !passwordMatches
      ) {
        return res
          .status(401)
          .json({
            message:
              "Invalid email or password.",
          });
      }


      res.json({
        message:
          "Login successful.",

        user: {
          id:
            user._id,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          username:
            user.username,

          email:
            user.email,

          profilePic:
            user.profilePic ||
            "",

          bio:
            user.bio ||
            "",
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      res
        .status(500)
        .json({
          message:
            "Could not log in.",
        });
    }
  }
);


/* =========================
   CONNECT TO MONGODB
========================= */

async function startServer() {
  try {
    await client.connect();

    db =
      client.db(
        process.env.DB_NAME
      );

    console.log(
      `Connected to MongoDB database: ${process.env.DB_NAME}`
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error
    );
  }
}


startServer();