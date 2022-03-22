const express = require('express');
const {
    requiresAuth
} = require('express-openid-connect');
const tmdb = require('../controllers/tmdb')

const users = require('../models/users');
const movies = require('../models/movies');
const ratings = require('../models/ratings');
const comments = require('../models/comments');

const router = express.Router();
const uri = 'https://api.themoviedb.org/3/movie/';


// UNTESTED ROUTE add rating to movie route
// each button (start) should have a value
// href="/add_rating?id=<%= movie.id  %>&release_date=<%= movie.release_date%>&value=<<btn value>>"
router.post('/add_rating', (req, res) => {
    const movie_id = req.query.id;
    const release_date = req.query.release_date;
    const value = req.query.value;
    let movie_mongo_id;
    const name = req.oidc.user.name;
    const email = req.oidc.user.email;
    let user_mongo_id;

    users.findOne({
        email: email
    }, (err, doc) => {
        if (err) {
            console.error(err);
        }
        if (doc === null) {
            let user = {
                name: name,
                email: email,
                voted: votedDate
            };
            users.create(user);
        } 
        users.findOne({
            email: email
        }, (err, doc) => {
            if (err) {
                console.error(err);
            }
            user_mongo_id = doc.id.toString()
        })
    })
    movies.findOne({
        movie_id: movie_id
    }, (err, doc) => {
        if (err) {
            console.error(err);
        }
        if (doc === null) {
            let movie = {
                movie_id: movie_id,
                release_date: new Date(release_date)
            };
            movies.create(movie);
        }
        movies.findOne({
            movie_id: movie_id
        }, (err, doc) => {
            if (err) {
                console.error(err);
            }
            movie_mongo_id = doc.id.toString()
        })
    })
    const rating = {
        user_id: user_mongo_id,
        movie_id: movie_mongo_id,
        rating: value
    };
    ratings.create(rating);
    // check if movie_id is still viable
    // check if comment updates effectively
    // else run through the get() for '/details' 
    res.redirect(`/details?id=${movie_id}`)

});



// UNTESTED ROUTE add comment to movie route
// href="/add_rating?id=<%= movie.id  %>&release_date=<%= movie.release_date%>"
router.post('/add_comment', (req, res) => {
    const movie_id = req.query.id;
    const release_date = req.query.release_date;
    const createdOn = new Date();
    let movie_mongo_id;
    const name = req.oidc.user.name;
    const email = req.oidc.user.email;
    let user_mongo_id;
    const textBody = req.body.comment;

    users.findOne({
        email: email
    }, (err, doc) => {
        if (err) {
            console.error(err);
        }
        if (doc === null) {
            let user = {
                name: name,
                email: email,
                voted: votedDate
            };
            users.create(user);
        } 
        users.findOne({
            email: email
        }, (err, doc) => {
            if (err) {
                console.error(err);
            }
            user_mongo_id = doc.id.toString()
        })
    })
    movies.findOne({
        movie_id: movie_id
    }, (err, doc) => {
        if (err) {
            console.error(err);
        }
        if (doc === null) {
            let movie = {
                movie_id: movie_id,
                release_date: new Date(release_date)
            };
            movies.create(movie);
        }
        movies.findOne({
            movie_id: movie_id
        }, (err, doc) => {
            if (err) {
                console.error(err);
            }
            movie_mongo_id = doc.id.toString()
        })
    })
    const comment = {
        user_id: user_mongo_id,
        movie_id: movie_mongo_id,
        createdOn: createdOn,
        comment: textBody
    };
    comments.create(comment);
    // check if movie_id is still viable
    // check if comment updates effectively
    // else run through the get() for '/details' 
    res.redirect(`/details?id=${movie_id}`)
});

// individual movie details page's route
router.get('/details', async (req, res) => {
    const movie_id = req.query.id;
    let movie_mongo_id;
    const get_movie = await tmdb.get_movie(`${uri}${movie_id}?api_key=${process.env.API_KEY}&language=en-US`);
    const title = get_movie.title;

    movies.findOne({
        movie_id: movie_id
    }, (err, doc) => {
        if (err) {
            console.error(err);
        }
        if (doc !== null) {
            movie_mongo_id = doc._id.toString();
            ratings.find({
                    'category.movie_id': 'movie_mongo_id'
                })
                .then(ratings => {
                    comments.find({
                            'category.movie_id': 'movie_mongo_id'
                        })
                        .then(comments => {
                            res.render('details', {
                                title: title,
                                movie: get_movie,
                                ratings: ratings,
                                comments: comments
                            });
                        })
                })
                .catch(error => {
                    console.error(error);
                })

        } else {
            const ratings = [];
            const comments = [];
            res.render('details', {
                title: title,
                movie: get_movie,
                ratings: ratings,
                comments: comments
            });
        }
    })
});

// homepage route
router.get('/', async (req, res) => {
    const now_playing = await tmdb.get_now_playing(`${uri}now_playing?api_key=${process.env.API_KEY}&language=en-US&page=1`);
    res.render('index', {
        title: 'Homepage',
        movies: now_playing
    });
});

module.exports = router;