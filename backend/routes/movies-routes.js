const express = require('express');
const { check } = require('express-validator');

const moviesControllers = require('../controllers/movies-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/:mid', moviesControllers.getMovieById);

router.get('/user/:uid', moviesControllers.getMoviesByUserId);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
  ],
  moviesControllers.createMovie
);

router.patch(
  '/:mid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  moviesControllers.updateMovie
);

router.delete('/:mid', moviesControllers.deleteMovie);

module.exports = router;
