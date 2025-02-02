const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const user = new User({
    username,
    name,
  })

  user.password = password

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User
  // .find({}).populate('blogs') // If we want whole documents to be referenced in User object (not only Id's)
    .find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 }) // If we want to see particular values to be referenced (Here without "user")
  response.json(users)
})

usersRouter.delete('/:id', async (request, response) => {
  await User.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter