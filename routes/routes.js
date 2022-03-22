const express = require('express');
const tmdb = require('../controllers/tmdb');

const router = express.Router();
const uri = 'https://api.themoviedb.org/3/movie/';


// homepage route
router.get('/', async (req, res) => {
  const now_playing = await tmdb.get_now_playing(
    `${uri}now_playing?api_key=${process.env.API_KEY}&language=en-US&page=1`
  );
  res.render('index', {
    title: 'Homepage',
    movies: now_playing,
  });
});

module.exports = router;
