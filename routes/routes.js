const express = require('express');
const {
    requiresAuth
} = require('express-openid-connect');
const tmdb = require('../controllers/tmdb')

// const routes_controller = require('../controllers/routes_controller');
const router = express.Router();
const uri = 'https://api.themoviedb.org/3/movie/';

router.get('/details', async(req, res) => {
    const id = req.query.id;
    const get_movie = await tmdb.get_movie(`${uri}${id}?api_key=${process.env.API_KEY}&language=en-US`);
    const title = get_movie.title;
    res.render('details', {
        title: title,
        movie: get_movie
    });
});


router.get('/', async(req, res) => {
    const now_playing = await tmdb.get_now_playing(`${uri}now_playing?api_key=${process.env.API_KEY}&language=en-US&page=1`);
    res.render('index',{
        title: 'Homepage',
        movies: now_playing
    });
});

module.exports = router;