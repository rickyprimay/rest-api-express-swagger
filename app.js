require("dotenv/config")

const express = require("express")
const { json, urlencoded } = require("body-parser")
const morgan = require('morgan')
const userRouter = require("./routes/users.js")
const movieRouter = require("./routes/movies.js")
const swaggerDocs = require("./lib/swagger.js")
const { jsonError } = require("./middlewares/error.js")


const app = express()

app.use(morgan('tiny'))
app.use(json())
app.use(urlencoded({ extended: true }))


app.use('/users',userRouter)
app.use('/movies',movieRouter)

process.on('unhandledRejection', error => {
  console.error('Internal Server Error:', error.message);
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server tersedia di port ${process.env.PORT || 8080}`)

  swaggerDocs(app, process.env.PORT || 8080)

  app.use((_,res)=>res.status(404).json({error: 'Route tidak ditemukan', route: _.url}))
  app.use(jsonError)
})
