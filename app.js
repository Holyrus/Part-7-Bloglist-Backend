const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogRouter = require('./controllers/blogRouter')
const usersRouter = require('./controllers/usersRouter')
const loginRouter = require('./controllers/loginRouter')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('Connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
  })

app.use(cors())
// app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
// For using the userExtractor with all the routes:
// app.use(middleware.userExtractor)

// We can register the userExtractor only executed with path /api/blogs routes:
// app.use('/api/blogs', middleware.userExtractor, blogRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// After HTTP POST request to the /api/testing/reset empties the database.

// Enable 'if' statement when fixed the test functionality.
// On default must be enabled.

// if (process.env.NODE_ENV === 'test') {
const testingRouter = require('./controllers/testing')
app.use('/api/testing', testingRouter)
// }

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app