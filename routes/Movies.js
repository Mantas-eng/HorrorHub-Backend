const express = require('express');
const router = express.Router();
const movieController = require('../Controllers/movieController');
const authController = require('../Controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware');
const authverifyToken = require ('../middleware/authMiddleware');
const favoriteMoviesController = require('../Controllers/favoriteMovieController');
const favoriteMovies = require('../models/favoriteMovies');
router.get('/movies', movieController.getAllMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/favoritemovies', favoriteMoviesController.getAllMovies);
router.get('/favoritemovies/:id',favoriteMoviesController.getMovieById);
router.post('/favoritemovies',favoriteMoviesController.createMovie);
router.put('/favoritemovies/:id',favoriteMoviesController.updateMovie);
router.delete('/favoritemovies/:id',favoriteMoviesController.deleteMovie);
router.post('/movies', movieController.createMovie);
router.put('/movies/:id', movieController.updateMovie);
router.delete('/movies/:id', movieController.deleteMovie);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/userData', authverifyToken, (req, res) => {
    const userData = {
        username: req.user.username,
        password: req.user.password
    };
    res.json(userData);
});
router.get('/protected-route', authMiddleware, (req, res) => {
    res.json({ message: 'You are authenticated.' });
  });


module.exports = router;