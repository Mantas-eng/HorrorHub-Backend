const Movie = require('../models/movie');

const movieController = {
  getAllMovies: async (req, res) => {
    try {
      const movies = await Movie.find();
      res.json({
        movies
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  },

  getMovieById: async (req, res) => {
    const {
      id
    } = req.params;
    try {
      const movie = await Movie.findById(id);
      if (!movie) {
        return res.status(404).json({
          message: 'Movie not found'
        });
      }
      res.json({
        movie
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  },

  createMovie: async (req, res) => {
    const newMovie = req.body;
    try {
      const movie = await Movie.create(newMovie);
      res.status(201).json({
        movie
      });
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  },

  updateMovie: async (req, res) => {
    const {
      id
    } = req.params;
    const updatedMovie = req.body;
    try {
      const movie = await Movie.findByIdAndUpdate(id, updatedMovie, {
        new: true
      });
      if (!movie) {
        return res.status(404).json({
          message: 'Movie not found'
        });
      }
      res.json({
        movie
      });
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  },

  deleteMovie: async (req, res) => {
    const {
      id
    } = req.params;
    try {
      const movie = await Movie.findByIdAndDelete(id);
      if (!movie) {
        return res.status(404).json({
          message: 'Movie not found'
        });
      }
      res.status(204).end();
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  }
};

module.exports = movieController;