const express = require('express');
const { requiresAuth } = require('express-openid-connect');

const details_controller = require('../controllers/details_controller');
const router = express.Router();

// GET details page
router.get('/', details_controller.get_details);

// GET add rating to movie details page
router.get('/add_rating', requiresAuth(), details_controller.add_rating);

// GET update rating to movie details page
router.get('/update_rating', requiresAuth(), details_controller.update_rating);

// GET add comment to movie details page
router.post('/add_comment', requiresAuth(), details_controller.add_comment);

// GET add movie to favorite list
router.get('/add_favorite', requiresAuth(), details_controller.add_favorite);

// GET remove movie to favorite list
router.get('/delete_favorite', requiresAuth(), details_controller.delete_favorite);

// POST update comment on movie details page
router.post('/:id/update', requiresAuth(), details_controller.update_comment);

// POST delete comment from movie details page
router.post('/:id/delete', requiresAuth(), details_controller.delete_comment);

module.exports = router;