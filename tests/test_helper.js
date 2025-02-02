const Blog = require('../models/blog')
const User = require('../models/user')

const initialUser = [
  {
    'username': 'TestUser',
    'name': 'Test Name',
    'password': 'TestPassword123'
  }
]

// Initialize the test database before executing all tests

const initialBlogs = [
  {
    'title': '1 Initial title',
    'author': 'Me',
    'url': 'https://examplelink.edu',
    'likes': 301
  },
  {
    'title': '2 Initial title',
    'author': 'Me',
    'url': 'https://examplelink.edu',
    'likes': 234
  }
]

const nonExistingId = async () => {
  const blog = new Blog( {
    'title': 'Non existing blog within DB',
    'author': 'Me',
    'url': 'https://examplelink.edu',
    'likes': 404
  } )
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialUser,
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
}