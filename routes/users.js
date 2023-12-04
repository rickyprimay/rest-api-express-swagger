const express = require('express');

const jwt = require('../middlewares/authJWT.js');
const User = require('../models/user.js');

const router = express.Router();
/**
  * @swagger
  * definitions:
  *   Unauthorized:
  *     description: Anda harus login
  *     type: object
  *     properties:
  *       error:
  *         type: string
  *         description: Unauthorized error message
  * responses:
  *   Unauthorized:
  *     description: Unauthorized
  *     schema:
  *       $ref: '#/definitions/Unauthorized'
  * components:
  *   securitySchemas:
  *     bearerAuth:
  *       type: http
  *       scheme: bearer
  *       bearerFormat: JWT
  *   schemas:
  *     User:
  *       type: object
  *       properties:
  *         id:
  *           type: number
  *         email:
  *           type: string
  *         gender:
  *           type: string
  *         role:
  *           type: string
  *       examples:
  *         Joe:
  *           description: Contoh user baru
  *           value: '{"email": "joebiden@gamil.com","password": "joebree","gender":"male","role":"Provokator"}'
  *     Unauthorized:
  *       description: Anda harus login
  */

/**
  * @swagger
  * /users/login:
  *   post:
  *     summary: User Login
  *     description: Membuat jwt token untuk autentikasi
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *             email:
  *               type: string
  *             password:
  *               type: string
  *             required:
  *               - email
  *               - password
  *           examples:
  *             admin:
  *               description: Contoh admin login
  *               value: {"email": "admin", "password": "admin"}
  *     responses:
  *       200:
  *         description: Berhasil membuat jwt token
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 token:
  *                   type: string
  *                 user: 
  *                   $ref: '#/components/schemas/User'
  *       400:
  *         description: Email dan pasword diperlukan
  *       401:
  *         description: Email atau password salah
  */
router.post('/login', async (req, res) => {
  const loginData = User.validateLoginData(req.body);

  if (!loginData) {
    return res.status(400).json({ error: 'Email dan password diperlukan' });
  }

  const user = await User.findByEmail(loginData.email)

  if (!user || user.password !== loginData.password) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const token = jwt.sign({ userId: user.id })

  delete user.password

  res.json({ token, user, message: 'Berhasil login' })
})

/**
  * @swagger
  * '/users/register':
  *   post:
  *     summary: User Register
  *     description: Membuat data user baru di database
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/User'
  *           examples:
  *             Joe:
  *               description: Contoh user baru
  *               value: '{"email": "joebiden@gamil.com","password": "joebree","gender":"male","role":"Provokator"}'
  *     responses:
  *       201:
  *         description: User dibuat
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 userId:
  *                   type: number
  *       400:
  *         description: Data tidak valid
  */
router.post('/register', async (req,res) => {
  const userData = User.validateUserData(req.body);

  if (!userData) {
    return res.status(400).json({ error: 'Data tidak valid' })
  }

  const userId = await User.insert(userData)

  res.status(201).json({ message: "User dibuat", userId })
})

router.use(jwt)


/**
  * @swagger
  * '/users/':
  *   get:
  *     summary: List users
  *     description: List pagination user dengan maksimal 10 per halaman
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: List users
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 users:
  *                   type: array
  *                   items:
  *                     $ref: '#/components/schemas/User'
  *       400:
  *         description: Input halaman tidak valid
  *       401:
  *         $ref: '#/responses/Unauthorized'
  *   parameters:
  *     - name: page
  *       in: query
  *       description: Halaman untuk melihat list users
  *       schema:
  *         type: number
  */
router.get('/', async (req,res) => {
  const page = parseInt(req.query.page || '1')

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ error: 'Input halaman tidak valid' })
  }

  const users = await User.findAll(page)

  res.json({users})
})

/**
  * @swagger
  * '/users/{userId}':
  *   get:
  *     summary: Get users
  *     description: Get user
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: List users
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 user:
  *                   $ref: '#/components/schemas/User'
  *       404:
  *         description: User tidak ditemukan
  *       401:
  *         $ref: '#/responses/Unauthorized'
  *     parameters:
  *       - name: userId
  *         in: path
  *         description: Id dari User yang ingin di lihat
  *         schema:
  *           type: number
  */
router.get('/:id(\\d+)', async (req,res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })
  res.json({user})
})

/**
  * @swagger
  * '/users/{userId}':
  *   put:
  *     summary: Mengubah User
  *     description: Mengubah data untuk user
  *     security:
  *       - bearerAuth: []
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/User'
  *     responses:
  *       200:
  *         description: User berhasil diupdate
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
  *       - name: userId
  *         in: path
  *         description: Id dari User yang ingin di ubah
  *         schema:
  *           type: number
  */
router.put('/:id(\\d+)', async (req,res) => {
  const userData = User.partialValidateUserData(req.body);

  if (!userData) {
    return res.status(400).json({ error: 'Data tidak valid' })
  }

  userData.id = req.params.id

  await User.update(userData)

  res.json({ message: "User diupdate", location: `/users/${userData.id}` })
})

/**
  * @swagger
  * '/users/{userId}':
  *   delete:
  *     summary: Menghapus User
  *     description: Menghapus data untuk user
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: User berhasil dihapus
  *       401:
  *         $ref: '#/responses/Unauthorized'
  *     parameters:
  *       - name: userId
  *         in: path
  *         description: Id dari User yang ingin di hapus
  *         schema:
  *           type: number
  */
router.delete('/:id(\\d+)', async (req,res) => {
  await User.delete(req.params.id)
  res.json({ message: "User dihapus"})
})

module.exports = router
