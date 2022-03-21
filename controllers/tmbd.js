const app = require("express");

async function getPic(apiData) {
  return await fetch(
    `https://api.themoviedb.org/3/movie/711?api_key=97bec1ad4a2b74922d6d176e79edf55c&language=en-US`
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });
}
