const express = require('express');
const {
    requiresAuth
} = require('express-openid-connect');
const tmdb = require('../controllers/tmdb')

// const routes_controller = require('../controllers/routes_controller');
const router = express.Router();
const uri = 'https://api.themoviedb.org/3/movie/now_playing?api_key=97bec1ad4a2b74922d6d176e79edf55c&language=en-US&page=1';
router.get('/', async(req, res) => {
    const now_playing = await tmdb.get_now_playing(uri)
    res.render('index',{
        title: 'Homepage',
        movies: now_playing
    });
});

module.exports = router;