const express = require("express");
const { requiresAuth } = require("express-openid-connect");
const tmdb = require("../controllers/tmdb");

const users = require("../models/users");
const movies = require("../models/movies");
const ratings = require("../models/ratings");
const comments = require("../models/comments");

const router = express.Router();
const uri = "https://api.themoviedb.org/3/movie/";

// individual movie details page's route
router.get("/details", async (req, res) => {
  const movie_id = req.query.id;
  let movie_mongo_id;
  const get_movie = await tmdb.get_movie(
    `${uri}${movie_id}?api_key=${process.env.API_KEY}&language=en-US`
  );
  const title = get_movie.title;

  movies.findOne(
    {
      movie_id: movie_id,
    },
    (err, doc) => {
      if (err) {
        console.error(err);
      }
      if (doc !== null) {
        movie_mongo_id = doc._id.toString();
        ratings
          .find({
            "category.movie_id": "movie_mongo_id",
          })
          .then((ratings) => {
            comments
              .find({
                "category.movie_id": "movie_mongo_id",
              })
              .then((comments) => {
                res.render("details", {
                  title: title,
                  movie: get_movie,
                  ratings: ratings,
                  comments: comments,
                });
              });
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        const ratings = [];
        const comments = [];
        res.render("details", {
          title: title,
          movie: get_movie,
          ratings: ratings,
          comments: comments,
        });
      }
    }
  );
});

// homepage route
router.get("/", async (req, res) => {
  const now_playing = await tmdb.get_now_playing(
    `${uri}now_playing?api_key=${process.env.API_KEY}&language=en-US&page=1`
  );
  res.render("index", {
    title: "Homepage",
    movies: now_playing,
  });
});

module.exports = router;
