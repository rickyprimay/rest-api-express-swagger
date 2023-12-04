const express = require('express');
const { json } = require('body-parser');

const jwt = require('../middlewares/authJWT.js');
const Movie = require('../models/movie.js');

const router = express.Router();

router.use(jwt)
/**
  * @swagger
  * components:
  *   schemas:
  *     Movie:
  *       type: object
  *       properties:
  *         id:
  *           type: number
  *         title:
  *           type: string
  *         genres:
  *           type: string
  *         year:
  *           type: string
  *     MovieInsert:
  *       type: object
  *       properties:
  *         title:
  *           type: string
  *         genres:
  *           type: string
  *         year:
  *           type: string
  */

/**
  * @swagger
  * '/movies/{movieId}':
  *   get:
  *     summary: Get movie
  *     description: Get movie
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Movie data
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 movie:
  *                   $ref: '#/components/schemas/Movie'
  *       404:
  *         description: Movie tidak ditemukan
  *       401:
  *         $ref: '#/responses/Unauthorized'
  *     parameters:
  *       - name: movieId
  *         in: path
  *         description: Id dari Movie yang ingin di lihat
  *         schema:
  *           type: number
  */
router.get('/:id(\\d+)', async (req, res) => {
  const movie = await Movie.findById(parseInt(req.params.id));
  if (!movie) {
    return res.status(404).json({ error: 'Movie tidak ditemukan' });
  }
  res.json({ movie })
})

/**
  * @swagger
  * '/movies/':
  *   get:
  *     summary: List movies
  *     description: List pagination movies dengan maksimal 10 per halaman
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: List movies
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 movies:
  *                   type: array
  *                   items:
  *                     $ref: '#/components/schemas/Movie'
  *       400:
  *         description: Input halaman tidak valid
  *       401:
  *         $ref: '#/responses/Unauthorized'
  *     parameters:
  *       - name: page
  *         in: query
  *         description: Halaman untuk melihat list movies
  *         schema:
  *           type: number
  */
router.get('/', async (req,res) => {
  const page = parseInt(req.query.page || '1')
  if (isNaN(page)) return res.status(400).json({ error: 'Input halaman tidak valid' })
  const movies = await Movie.findAll(page)
  res.json({ movies })
})

/**
  * @swagger
  * '/movies/':
  *   post:
  *     summary: Tambah movie
  *     description: Membuat data movie baru di database
  *     security:
  *       - bearerAuth: []
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/MovieInsert'
  *     responses:
  *       201:
  *         description: Movie dibuat
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 movieId:
  *                   type: number
  *       400:
  *         description: Data tidak valid
  */
router.post('/', async (req,res) => {
  const movieData = Movie.validateMovieData(req.body);

  if (!movieData) {
    return res.status(400).json({ error: 'Data tidak valid' })
  }

  const movieId = await Movie.insert(movieData)

  res.status(201).json({ message: "Movie dibuat", movieId })
})

/**
  * @swagger
  * '/movies/{movieId}':
  *   put:
  *     summary: Mengubah Movie
  *     description: Mengubah data untuk movie
  *     security:
  *       - bearerAuth: []
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/Movie'
  *     responses:
  *       200:
  *         description: Movie berhasil diupdate
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 location:
  *                   type: string
  *       400:
  *         description: Data tidak valid
  *       401:
  *         $ref: '#/responses/Unauthorized'
  *     parameters:
  *       - name: movieId
  *         in: path
  *         description: Id dari movie yang ingin di ubah
  *         schema:
  *           type: number
  */
router.put('/:id(\\d+)', async (req,res) => {
  const movieData = Movie.partialValidateMovieData(req.body);

  if (!movieData) {
    return res.status(400).json({ error: 'Data tidak valid' })
  }

  movieData.id = req.params.id

  await Movie.update(movieData)

  res.json({ message: "Movie diupdate", location: `/movies/${movieData.id}` })
})

/**
  * @swagger
  * '/movies/{movieId}':
  *   delete:
  *     summary: Menghapus Movie
  *     description: Menghapus data untuk movie
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Movie berhasil dihapus
  *       401:
  *         $ref: '#/responses/Unauthorized'
  *     parameters:
  *       - name: movieId
  *         in: path
  *         description: Id dari movie yang ingin di hapus
  *         schema:
  *           type: number
  */
router.delete('/:id(\\d+)', async (req,res) => {
  await Movie.delete(req.params.id)
  res.json({ message: "Movie dihapus"})
})

module.exports = router
