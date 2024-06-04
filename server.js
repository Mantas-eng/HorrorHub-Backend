require('dotenv').config();

const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const movieRoutes = require('./routes/Movies');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

const corsOptions = {
  origin: ['https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.prepare().then(() => {
  const server = express();

  server.use(cors(corsOptions));
  server.use(express.json());
  server.use(movieRoutes);
  server.options('*', cors(corsOptions));
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    next();
  });
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  mongoose
    .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      server.listen(PORT, '0.0.0.0', (err) => {
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
