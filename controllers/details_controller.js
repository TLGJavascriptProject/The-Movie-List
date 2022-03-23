const tmdb = require('./tmdb');

const users = require('../models/users');
const movies = require('../models/movies');
const ratings = require('../models/ratings');
const comments = require('../models/comments');

const uri = 'https://api.themoviedb.org/3/movie/';

exports.delete_comment = (req, res) => {
    const movie_id = req.query.id;

    candidates.findByIdAndDelete({
        _id: req.params.id,
    }, (err) => {
        if (err) {
            console.error(err)
        } else {
            res.redirect(`/details?id=${movie_id}`);
        }
    });
};

exports.update_comment = (req, res) => {
    const movie_id = req.query.id;
    const textBody = req.body.comment;

    comments.findByIdAndUpdate({
        _id: req.params.id
    }, {
        comment: textBody
    }, {
        upsert: true
    }, (err) => {
        if (err) {
            console.error(err);
        } else {
            res.redirect(`/details?id=${movie_id}`);
        }
    });
};

exports.add_rating = (req, res) => {
    const movie_id = req.query.id;
    const release_date = req.query.release_date;
    const value = req.query.value;
    const name = req.oidc.user.name;
    const email = req.oidc.user.email;

    users.findOne({
            email: email
        })
        .then(user => {

            if (user === null) {
                let user = {
                    name: name,
                    email: email,
                };
                users.create(user);
            }
        })
        .catch(err => console.error(err));

    movies.findOne({
            movie_id: movie_id
        })
        .then(result => {
            if (result === null) {
                let movie = {
                    movie_id: movie_id,
                    release_date: new Date(release_date)
                };
                movies.create(movie);
            }
        })
        .catch(err => console.error(err));

    ratings.find({
            'category.movie_id': 'movie_id',
        })
        .then(result => {
            if (result.user_id !== email) {
                const rating = {
                    user_id: email,
                    movie_id: movie_id,
                    rating: value
                };
                ratings.create(rating);
            } else {
                ratings.findOneAndUpdate({
                        user_id: email,
                        movie_id: movie_id
                    }, {
                        rating: value
                    },
                    (err) => {
                        if (err) {
                            console.error(err)
                        }
                    });
            }
            res.redirect(`/details?id=${movie_id}`);
        })
        .catch(err => console.error(err));
};

// UNTESTED ROUTE add comment to movie route
exports.add_comment = (req, res) => {
    const movie_id = req.query.id;
    const release_date = req.query.release_date;
    const createdOn = new Date();
    const name = req.oidc.user.name;
    const email = req.oidc.user.email;
    const textBody = req.body.comment;

    users.findOne({
            email: email
        })
        .then(user => {

            if (user === null) {
                let user = {
                    name: name,
                    email: email,
                };
                users.create(user);
            }
        })
        .catch(err => console.error(err));

    movies.findOne({
            movie_id: movie_id
        })
        .then(result => {
            if (result === null) {
                let movie = {
                    movie_id: movie_id,
                    release_date: new Date(release_date)
                };
                movies.create(movie);
            }
        })
        .catch(err => console.error(err));
    const comment = {
        user_id: email,
        movie_id: movie_id,
        createdOn: createdOn,
        comment: textBody
    };
    comments.create(comment)
        .then(result => {
            res.redirect(`/details?id=${movie_id}`);
        });
};

// individual movie details page's route
exports.get_details = async (req, res) => {
    const movie_id = req.query.id;
    let movie_mongo_id;
    const get_movie = await tmdb.get_movie(
        `${uri}${movie_id}?api_key=${process.env.API_KEY}&language=en-US`
    );
    const title = get_movie.title;

    movies.findOne({
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
                        'category.movie_id': 'movie_mongo_id',
                    })
                    .then((ratings) => {
                        comments
                            .find({
                                'category.movie_id': 'movie_mongo_id',
                            })
                            .then((comments) => {
                                res.render('details', {
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
                res.render('details', {
                    title: title,
                    movie: get_movie,
                    ratings: ratings,
                    comments: comments,
                });
            }
        }
    );
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
};