const tmdb = require('./tmdb');

const users = require('../models/users');
const movies = require('../models/movies');
const ratings = require('../models/ratings');
const comments = require('../models/comments');

const uri = 'https://api.themoviedb.org/3/movie/';

exports.delete_favorite = (req, res) => {
    const movie_id = req.query.id;
    const email = req.oidc.user.email;
    users.findOneAndUpdate({
        email: email
    }, {
        $pull: {
            favorites: movie_id
        }
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

exports.add_favorite = (req, res) => {
    const movie_id = req.query.id;
    const email = req.oidc.user.email;
    users.findOneAndUpdate({
        email: email
    }, {
        $push: {
            favorites: movie_id
        }
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

exports.delete_comment = (req, res) => {
    const movie_id = req.body.movie_id;

    comments.findByIdAndDelete({
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
    const movie_id = req.body.movie_id;
    const textBody = req.body.comment_text;

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

exports.update_rating = (req, res) => {
    const movie_id = req.query.id;
    const value = req.query.value;
    const email = req.oidc.user.email;

    ratings.findOneAndUpdate({
        movie_id: movie_id,
        user_id: email
    }, {
        rating: value
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

// add comment to movie route
exports.add_comment = (req, res) => {
    const movie_id = req.body.movie_id;
    const release_date = req.body.release_date;
    const createdOn = new Date();
    const name = req.oidc.user.name;
    const email = req.oidc.user.email;
    const textBody = req.body.comment_text;

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
    let user = null;
    if (req.oidc.isAuthenticated()) {
        user = req.oidc.user;
    }
    const get_movie = await tmdb.get_movie(
        `${uri}${movie_id}?api_key=${process.env.API_KEY}&language=en-US`
    );
    const get_trailer = await tmdb.get_movie(
        `${uri}${movie_id}/videos?api_key=${process.env.API_KEY}&language=en-US`
    )
    const title = get_movie.title;

    users.findOne({
            email: req.oidc.user.email
        })
        .then((results) => {
            movies.findOne({
                    movie_id: movie_id,
                },
                (err, doc) => {
                    if (err) {
                        console.error(err);
                    }
                    if (doc !== null) {
                        ratings
                            .find({
                                movie_id: movie_id,
                            })
                            .then((ratings) => {
                                comments
                                    .find({
                                        movie_id: movie_id,
                                    })
                                    .then((comments) => {
                                        res.render('details', {
                                            title: title,
                                            movie: get_movie,
                                            videos: get_trailer,
                                            ratings: ratings,
                                            comments: comments,
                                            isAuthenticated: req.oidc.isAuthenticated(),
                                            user: user,
                                            users: results,
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
                            videos: get_trailer,
                            ratings: ratings,
                            comments: comments,
                            isAuthenticated: req.oidc.isAuthenticated(),
                            user: user,
                            users: results,
                        });
                    }
                }
            );
        })
        .catch((error) => {
            console.error(error);
        });
};