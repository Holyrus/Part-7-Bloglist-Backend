// npm install jsonwebtoken

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  // The code searching for the user from the DB by the 'username'
  const user = await User.findOne({ username })
  // The code checks the 'password', attached to request
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash) // This method compared hashed password in request and DB

  // If the user is not found, or password is incorect, request responded with status 401 unauthorized.
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid username or password'
    })
  }

  // If the password is correct, a token is created. Token contains the username and user id in a digitally signed form.
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // The digital signature ensures that only parties who know the secret can generate a valid token.
  // The value for the env variable must be set in the .env file
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 } // Token expires in one hour (This will force the user to re-login to the app)
  )

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter