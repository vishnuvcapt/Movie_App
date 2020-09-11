import React from 'react';

import Card from '../../shared/components/UIElements/Card';
import MovieItem from './MovieItem';
import Button from '../../shared/components/FormElements/Button';
import './MovieList.css';

const MovieList = props => {
  if (props.items.length === 0) {
    return (
      <div className="movie-list center">
        <Card>
          <h2>No movies found. Maybe create one?</h2>
          <Button to="/movies/new">Share Movie</Button>
        </Card>
      </div>
    );
  }
 
  return (
    <ul className="movie-list">
      {props.items.map(movie => (
        <MovieItem
          key={movie.id}
          id={movie.id}
          image={movie.imageUrl}
          title={movie.title}
          description={movie.description}
          creatorId={movie.creator}
          onDelete={props.onDeleteMovie}
        />
      ))}
    </ul>
  );
};

export default MovieList;
