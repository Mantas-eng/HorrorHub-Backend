const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const movieRoutes = require('./routes/Movies');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
require("dotenv").config
const corsOptions = {
  origin: ['http://localhost:3000', 'https://mantas-eng-horror-hub-front-end.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};  

app.prepare().then(() => {
  const server = express();

  server.use(cors(corsOptions));
  server.use(express.json());
  server.use(movieRoutes);

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  mongoose
    .connect(MONGO_URL)
    .then(() => {
      console.log('Connected to MongoDB');
      server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
    });

  server.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).send('Internal Server Error');
  });
});