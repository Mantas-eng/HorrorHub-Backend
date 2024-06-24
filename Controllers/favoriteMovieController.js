const FavoriteMovie = require('../models/favoriteMovies');

const favoriteMoviesController = {
  getAllMovies: async (req, res) => {
    try {
      const favoriteMovies = await FavoriteMovie.find();
      res.json({ favoriteMovies });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMovieById: async (req, res) => {
    const { id } = req.params;
    try {
      const favoriteMovie = await FavoriteMovie.findById(id);
      if (!favoriteMovie) {
        return res.status(404).json({ message: 'Favorite Movie not found' });
      }
      res.json({ favoriteMovie });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createMovie: async (req, res) => {
    const newMovie = req.body;
    try {
      const favoriteMovie = await FavoriteMovie.create(newMovie);
      res.status(201).json({ favoriteMovie });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateMovie: async (req, res) => {
    const { id } = req.params;
    const updatedMovie = req.body;
    try {
      const favoriteMovie = await FavoriteMovie.findByIdAndUpdate(id, updatedMovie, { new: true });
      if (!favoriteMovie) {
        return res.status(404).json({ message: 'Favorite Movie not found' });
      }
      res.json({ favoriteMovie });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteMovie: async (req, res) => {
    const { id } = req.params;
    try {
      const favoriteMovie = await FavoriteMovie.findByIdAndDelete(id);
      if (!favoriteMovie) {
        return res.status(404).json({ message: 'Favorite Movie not found' });
      }
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = favoriteMoviesController;
