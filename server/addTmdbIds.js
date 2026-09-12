import dotenv from "dotenv";
import {
  MongoClient,
} from "mongodb";

dotenv.config();

const client = new MongoClient(
  process.env.MONGODB_URI
);

async function addTmdbIds() {
  try {
    await client.connect();

    const db = client.db(
      process.env.DB_NAME
    );

    const moviesCollection =
      db.collection("movies");

    const movies =
      await moviesCollection
        .find({})
        .toArray();

    console.log(
      `Found ${movies.length} movies.\n`
    );

    for (const movie of movies) {
      // If we've already added a TMDB ID,
      // don't look it up again.
      if (movie.tmdbId) {
        console.log(
          `✓ ${movie.title} already has TMDB ID ${movie.tmdbId}`
        );

        continue;
      }

      console.log(
        `Searching for: ${movie.title} (${movie.year})`
      );

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${
          process.env.TMDB_API_KEY
        }&query=${encodeURIComponent(
          movie.title
        )}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.log(
          `✗ TMDB error for ${movie.title}`
        );

        continue;
      }

      if (
        !data.results ||
        data.results.length === 0
      ) {
        console.log(
          `✗ No TMDB results found for ${movie.title}`
        );

        continue;
      }

      // First try to find the exact
      // title AND release year.
      let match =
        data.results.find(
          (result) => {
            const resultYear =
              result.release_date
                ? Number(
                    result.release_date.substring(
                      0,
                      4
                    )
                  )
                : null;

            const titleMatches =
              result.title
                ?.trim()
                .toLowerCase() ===
                movie.title
                  .trim()
                  .toLowerCase() ||
              result.original_title
                ?.trim()
                .toLowerCase() ===
                movie.title
                  .trim()
                  .toLowerCase();

            return (
              titleMatches &&
              resultYear ===
                Number(movie.year)
            );
          }
        );

      // If title + year didn't work,
      // try exact title only.
      if (!match) {
        match =
          data.results.find(
            (result) =>
              result.title
                ?.trim()
                .toLowerCase() ===
                movie.title
                  .trim()
                  .toLowerCase() ||
              result.original_title
                ?.trim()
                .toLowerCase() ===
                movie.title
                  .trim()
                  .toLowerCase()
          );
      }

      if (!match) {
        console.log(
          `✗ Could not confidently match ${movie.title}`
        );

        continue;
      }

      await moviesCollection.updateOne(
        {
          _id: movie._id,
        },
        {
          $set: {
            tmdbId: match.id,
          },
        }
      );

      console.log(
        `✓ ${movie.title} → TMDB ID ${match.id}`
      );
    }

    console.log(
      "\nFinished adding TMDB IDs."
    );
  } catch (error) {
    console.error(
      "TMDB ID script error:",
      error
    );
  } finally {
    await client.close();
  }
}

addTmdbIds();