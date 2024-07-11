    const express = require('express');
    const router = express.Router();
    const movieController = require('../Controllers/movieController');
    const authController = require('../Controllers/authController'); 
    const authMiddleware = require('../middleware/authMiddleware');
    const authorizeAdmin = require('../middleware/authorizeAdmin');
    const favoriteMoviesController = require('../Controllers/favoriteMovieController');
    const path = require('path');
    
    router.use(express.static(path.join(__dirname, '../public')));

    router.get('/movies', movieController.getAllMovies);
    router.get('/movies/:id', movieController.getMovieById);

    router.get('/favoritemovies', favoriteMoviesController.getAllMovies);
    router.get('/favoritemovies/:id', favoriteMoviesController.getMovieById);

    router.post('/favoritemovies', authMiddleware, favoriteMoviesController.createMovie);
    router.put('/favoritemovies/:id', authMiddleware, favoriteMoviesController.updateMovie);
    router.delete('/favoritemovies/:id', authMiddleware, favoriteMoviesController.deleteMovie);

    router.post('/movies', authMiddleware, authorizeAdmin, movieController.createMovie);
    router.put('/movies/:id', authMiddleware, authorizeAdmin, movieController.updateMovie);
    router.delete('/movies/:id', authMiddleware, authorizeAdmin, movieController.deleteMovie);

    router.post('/login', authController.login);
    router.post('/register', authController.register);

    router.get('/userData', authMiddleware, (req, res) => {
        const userData = {
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
        };
        res.json(userData);
    });

    router.get('/protected-route', authMiddleware, (req, res) => {
        res.json({ message: 'You are authenticated.' });
    });

    router.get('/admin-only', authMiddleware, authorizeAdmin, (req, res) => {
        res.json({ message: 'Admins only route.' });
    });

    router.get('/verify/:userId/:uniqueString', authController.verifyEmail);

    router.get('/verify', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/verified.html'));
    });

    module.exports = router;
