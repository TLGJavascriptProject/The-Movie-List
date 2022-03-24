const express = require('express');
const tmdb = require('../controllers/tmdb');
const users = require('../models/users');

const router = express.Router();
const uri = 'https://api.themoviedb.org/3/movie/';



// Favorites route
router.get('/favorites', async (req, res) => {
    const email = req.oidc.user.email;
    const user = await users.findOne({
        email: email
    })
    let arr = new Array(user.favorites.length);
    const movies = async (arr) => {
        await Promise.all(user.favorites.map(async (favorite) => {
            const movie = await tmdb.get_movie(`${uri}${favorite}?api_key=${process.env.API_KEY}&language=en-US`);
            arr.push(movie);
        }));
    };
    await movies(arr);
    const thisUser = await user;
    console.log(arr)
    res.render('favorites', {
        title: 'Favorite Movies',
        movies: arr,
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
        users: thisUser,
    });
});

// Upcoming route
router.get('/coming_soon', async (req, res) => {
    let user = null;
    let email = null;
    if (req.oidc.isAuthenticated()) {
        user = req.oidc.user;
        email = req.oidc.user.email;
    }
    const thisUser = await users.findOne({
        email: email
    })
    const now_playing = await tmdb.get_now_playing(
        `${uri}upcoming?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );
    await now_playing.sort((a, b) => (a.release_date > b.release_date) ? 1 : -1);
    res.render('coming_soon', {
        title: 'Coming Soon',
        movies: now_playing,
        isAuthenticated: req.oidc.isAuthenticated(),
        user: user,
        users: thisUser,
    });
});

// homepage route
router.get('/', async (req, res) => {
    let user = null;
    let email = null;
    if (req.oidc.isAuthenticated()) {
        user = req.oidc.user;
        email = req.oidc.user.email;
    }
    const thisUser = await users.findOne({
        email: email
    })
    const now_playing = await tmdb.get_now_playing(
        `${uri}now_playing?api_key=${process.env.API_KEY}&language=en-US&page=1`
    );
    await now_playing.sort((a, b) => (a.release_date < b.release_date) ? 1 : -1);
    res.render('index', {
        title: 'Homepage',
        movies: now_playing,
        isAuthenticated: req.oidc.isAuthenticated(),
        user: user,
        users: thisUser,
    });
});

module.exports = router;