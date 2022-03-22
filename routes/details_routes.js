const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const tmdb = require('../controllers/tmdb');

const details_controller = require('../controllers/details_controller');

const router = express.Router();

// GET details page
router.get('/details', details_controller.get_details);

// GET add rating to movie details page
router.get('/add_rating', requiresAuth(), details_controller.add_rating);

// GET add comment to movie details page
router.get('/add_comment', requiresAuth(), details_controller.add_comment);

module.exports = router;