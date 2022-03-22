const fetch = require("node-fetch");

exports.get_now_playing = async (uri) => {
  const data = await fetch(uri);
  const movies = await data.json();
  return movies.results;
};

exports.get_movie = async (uri) => {
  const data = await fetch(uri);
  const movie = await data.json();
  return movie;
};
