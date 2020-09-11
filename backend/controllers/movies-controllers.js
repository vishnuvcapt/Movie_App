
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
 
 
const HttpError = require('../models/http-error');
const Movie = require('../models/movie');
const User = require('../models/user');



const getMovieById = async (req, res, next) => {
  const movieId = req.params.mid; // { mid: 'm1' }

  let movie;
  try {
    movie = await Movie.findById(movieId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a movie.',
      500
    );
    return next(error);
  }

  if (!movie) {
    const error = new HttpError(
      'Could not find a movie for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ movie: movie.toObject({ getters: true }) });
};

// function getMovieById() { ... }
// const getMovieById = function() { ... }

const getMoviesByUserId = async (req, res, next) => {
  const userId = req.params.uid; 
  let userWithMovies;
  try {
    userWithMovies = await User.findById(userId).populate('movies');
  } catch (err) {
    const error = new HttpError(
      'Fetching movies failed, please try again later',
      500
    );
    return next(error);
  }

  if (!userWithMovies || userWithMovies.movies.length === 0) {
    return next(
      new HttpError('Could not find movies for the provided user id.', 404)
    );
  }

  res.json({
    movies: userWithMovies.movies.map(movie =>
      movie.toObject({ getters: true })
    )
  });
};

const createMovie = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, creator } = req.body;


  // const title = req.body.title;
  const createdMovie = new Movie({
    title,
    description,
    image: req.file.path,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating movie failed, please try again', 500);
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }
  console.log(user);
 
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdMovie.save({ session: sess });
    user.movies.push(createdMovie);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating movie failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ movie: createdMovie });
};

const updateMovie = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
 
  const { title, description } = req.body;
  const movieId = req.params.mid;

  let movie;
  try {
    movie = await Movie.findById(movieId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update movie.',
      500
    );
    return next(error);
  }

  movie.title = title;
  movie.description = description;

  try {
    await movie.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update movie.',
      500
    );
    return next(error);
  }

  res.status(200).json({ movie: movie.toObject({ getters: true }) });
};

const deleteMovie = async (req, res, next) => {
  const movieId = req.params.mid;

  let movie;
  try {
    movie = await Movie.findById(movieId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete movie.',
      500
    );
    return next(error);
  }

  if (!movie) {
    const error = new HttpError('Could not find movie for this id.', 404);
    return next(error);
  }


  const imagePath = movie.image;


  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await movie.remove({ session: sess });
    movie.creator.movies.pull(movie);
    await movie.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete movie.',
      500
    );
    return next(error);
  }


  res.status(200).json({ message: 'Deleted movie.' });
};

exports.getMovieById = getMovieById;
exports.getMoviesByUserId = getMoviesByUserId;
exports.createMovie = createMovie;
exports.updateMovie = updateMovie;
exports.deleteMovie = deleteMovie;
