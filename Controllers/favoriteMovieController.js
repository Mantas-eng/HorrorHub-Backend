const FavoriteMovie = require('../models/favoriteMovie');

const favoriteMoviesController = {
  getAllFavoriteMovies: async (req, res) => {
    try {
      const favoriteMovies = await FavoriteMovie.find();
      res.json({ favoriteMovies });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching favorite movies: ' + error.message });
    }
  },

  getFavoriteMovieById: async (req, res) => {
    const { id } = req.params;
    try {
      const favoriteMovie = await FavoriteMovie.findById(id);
      if (!favoriteMovie) {
        return res.status(404).json({ message: 'Favorite movie not found' });
      }
      res.json({ favoriteMovie });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching favorite movie: ' + error.message });
    }
  },

  createFavoriteMovie: async (req, res) => {
    const newFavoriteMovie = req.body;
    try {
      const favoriteMovie = await FavoriteMovie.create(newFavoriteMovie);
      res.status(201).json({ favoriteMovie });
    } catch (error) {
      res.status(400).json({ message: 'Error creating favorite movie: ' + error.message });
    }
  },

  updateFavoriteMovie: async (req, res) => {
    const { id } = req.params;
    const updatedFavoriteMovie = req.body;
    try {
      const favoriteMovie = await FavoriteMovie.findByIdAndUpdate(id, updatedFavoriteMovie, { new: true });
      if (!favoriteMovie) {
        return res.status(404).json({ message: 'Favorite movie not found' });
      }
      res.json({ favoriteMovie });
    } catch (error) {
      res.status(400).json({ message: 'Error updating favorite movie: ' + error.message });
    }
  },

  deleteFavoriteMovie: async (req, res) => {
    const { id } = req.params;
    try {
      const favoriteMovie = await FavoriteMovie.findByIdAndDelete(id);
      if (!favoriteMovie) {
        return res.status(404).json({ message: 'Favorite movie not found' });
      }
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: 'Error deleting favorite movie: ' + error.message });
    }
  }
};

module.exports = favoriteMoviesController;
