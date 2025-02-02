const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

// If you have middleware token extractor you dont need this

// This helper function isolates the token from the authorization header
// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }

// ----------------------------------------------------------

// With using express-async-errors
// npm install express-async-errors
// We dont need to call next(exception) anymore.

blogRouter.get('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return (response.status(401).json({ error: 'Token invalid' }))
  }
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 }) // For showing particular values in each blog in DB about user that owns it
  response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  // Checking the validity of the token with 'jwt.verify'
  //The object decoded from the token contains the username and id fields, which tell the server who made the request.
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  // If the object decoded from the token does not contain the (decodedToken.id is undefined)
  // returned 401 unauthorized
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
  response.json(blog)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    user.blogs = user.blogs.filter(b => b.id.toString() !== request.params.id)
    await user.save()
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'Invalid operation' })
  }
})

// -------------------------------

// With async/await syntax

// blogRouter.get('/', async (request, response) => {
//   const blogs = await Blog.find({})
//   response.json(blogs)
// })

// blogRouter.post('/', async (request, response, next) => {
//   const blog = new Blog(request.body)

//   try {
//     const savedBlog = await blog.save()
//     response.status(201).json(savedBlog)
//   } catch(exception) {
//     next(exception)
//   }
// })

// blogRouter.get('/:id', async (request, response, next) => {
//   try {
//     const blog = await Blog.findById(request.params.id)
//     if (blog) {
//       response.json(blog)
//     } else {
//       response.status(404).end()
//     }
//   } catch(exception) {
//     next(exception)
//   }
// })

// blogRouter.delete('/:id', async (request, response, next) => {
//   try {
//     await Blog.findByIdAndDelete(request.params.id)
//     response.status(204).end()
//   } catch(exception) {
//     next(exception)
//   }
// })

// -------------------------

// Without async/await syntax

// blogRouter.get('/', (request, response) => {
//   Blog
//     .find({})
//     .then(blogs => {
//       response.json(blogs)
//     })
// })

// blogRouter.get('/:id', (request, response, next) => {
//   Blog.findById(request.params.id)
//     .then(blog => {
//       if (blog) {
//         response.json(blog)
//       } else {
//         response.status(404).end()
//       }
//     })
//     .catch(error => next(error))
// })

// blogRouter.post('/', (request, response, next) => {
//   const blog = new Blog(request.body)

//   blog
//     .save()
//     .then(result => {
//       response.status(201).json(result)
//     })
//     .catch(error => next(error))
// })

// blogRouter.delete('/:id', (request, response, next) => {
//   Blog.findByIdAndDelete(request.params.id)
//     .then(() => {
//       response.status(204).end()
//     })
//     .catch(error => next(error))
// })

// -----------------------------

module.exports = blogRouter