const sql = require('../lib/postgres.js')

const Movie = {}

Movie.findAll = async function(page = 1) {
  return await sql`SELECT * FROM movies LIMIT 10 OFFSET ${(page - 1) * 10}`
}

Movie.findById = async function(id) {
  const [movie] = await sql`SELECT * FROM movies WHERE id = ${id} LIMIT 1`
  return movie
}

Movie.insert = async function(movieData) {
  movieData.id = sql`(select id from movies order by id desc limit 1) + 1`
  const [movie] = await sql`
  INSERT INTO movies ${
    sql(movieData,['id','title','genres','year'])
  }
  RETURNING id
  `
  return movie.id
}

Movie.update = async function(movieData) {
  const vals = Object.keys(movieData)
  await sql`
  UPDATE movies set ${
    sql(movieData,vals)
  }
  WHERE id = ${movieData.id}
  `
}

Movie.delete = async function(id) {
  await sql`DELETE FROM movies WHERE id = ${id}`
}

Movie.validateMovieData = function(movieData) {
  if (movieData && movieData.title && movieData.genres && movieData.year) {
    return movieData
  }
  return false
}

Movie.partialValidateMovieData = function(movieData) {
  if (movieData && movieData.title || movieData.genres || movieData.year) {
    return movieData
  }
  return false
}

module.exports = Movie

