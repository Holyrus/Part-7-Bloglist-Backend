const { test, describe, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const helper = require('./test_helper')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')


describe('When there is initialy some blogs saved', () => {

  // For running test one by one we can use following syntax:
  // test.only('Blogs are returned as json', async () => {
  //  // ...
  // })

  // Then run 'only marked tests' with the option:
  // npm test -- --test-only

  // --------

  // Also we can run tests defined only in this file:
  // npm test -- tests/blog_api.test.js

  // or with specific pattern
  // npm test -- --test-name-pattern="There are two blogs"

  // or if every test name that contain specific word:
  // npm test -- --test-name-pattern="blogs"

  // -------------------------------------------------------

  // Database is cleared out at the beginning
  // After that initial blogs will be stored in database
  // Doing this for ensuring that every test run DB is the same

  beforeEach(async () => {
    await User.deleteMany({})
    await api
      .post('/api/users')
      .send(helper.initialUser[0])

    await Blog.deleteMany({})

    const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
    const token = res.body.token

    await api
      .post('/api/blogs')
      .send(helper.initialBlogs[0])
      .set('Authorization', `Bearer ${token}`)

    await api
      .post('/api/blogs')
      .send(helper.initialBlogs[1])
      .set('Authorization', `Bearer ${token}`)

    // This code for executing the promises it receives in parallel

    // const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    // const promiseArray = blogObjects.map(blog => blog.save())
    // await Promise.all(promiseArray)

    // ------------------------------------------

    // This code for executing promises in a particular order

    // for (let blog of helper.initialBlogs) {
    //   let blogObject = new Blog(blog)
    //   await blogObject.save()
    // }

    // ------------------------------------------

    // If we have initial test DB in helper

    // await Blog.deleteMany({})
    // await Blog.insertMany(helper.initialBlogs)

    // ------------------------------------------

    // This code for saving one individual object

    // let blogObject = new Blog(helper.initialBlogs[0])
    // await blogObject.save()

    // blogObject = new Blog(helper.initialBlogs[1])
    // await blogObject.save()

    // ------------------------------------------
  })

  // -------------------------------------------------

  test('Blogs are returned as json', async () => {
    const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
    const token = res.body.token

    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('All blogs are returned', async () => {
    const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
    const token = res.body.token

    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  // test('Somewhere in blogs there is a title "1 Initial title"', async () => {
  //   const response = await api.get('/api/blogs')

  //   const titles = response.body.map(e => e.title)
  //   assert.strictEqual(titles.includes('1 Initial title'), true)
  // })

  // describe('Viewing a specific blog', () => {

  //   // Test for check of ability of fetching individual blog

  //   test('A specific blog can be viewed', async () => {
  //     const blogsAtStart = await helper.blogsInDb()

  //     const blogToView = blogsAtStart[0]

  //     const resultBlog = await api
  //       .get(`/api/blogs/${blogToView.id}`)
  //       .expect(200)
  //       .expect('Content-Type', /application\/json/)

  //     assert.deepStrictEqual(resultBlog.body, blogToView)
  //   })

  //   // Test for failing with status 404 if blog does not exist

  //   test('Fails with status 404 if blog does not exist', async () => {
  //     const validNoneExistingId = await helper.nonExistingId()

  //     await api
  //       .get(`/api/blogs/${validNoneExistingId}`)
  //       .expect(404)
  //   })

  //   // Test for failing with status 400 if id is invalid

  //   test('Fails with status 400 id is invalid', async () => {
  //     const invalidId = '5a3d5da59070081a82a3445'

  //     await api
  //       .get(`/api/blogs/${invalidId}`)
  //       .expect(400)
  //   })

  // })

  describe('Addition of a new blog', () => {

    // Adding new blog and verifies the number of blogs returned by
    // the API increases and that the newly added blog is in the list.

    test('A valid blog can be added ', async () => {
      const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
      const token = res.body.token

      const newBlog = {
        'title': 'Test blog',
        'author': 'Me',
        'url': 'https://examplelink.edu',
        'likes': 909
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(blog => blog.title)
      assert(titles.includes('Test blog'))
    })

    // Test that verifies that a blog without title won't be saved into the DB

    test('Fails with status 400 if data invalid (Blog without title not added)', async () => {
      const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
      const token = res.body.token

      const newBlog = {
        'author': 'Me',
        'url': 'https://examplelink.edu',
        'likes': 909
      }

      await api
        .post ('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length, 'Blog count should not increase')
    })

    // Test that verifies that a blog without url won't be saved into the DB

    test('Blog without url is not added', async () => {
      const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
      const token = res.body.token

      const newBlog = {
        'title': 'Without url',
        'author': 'Me',
        'likes': 234
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length, 'Blog count should not increase')
    })

    // Test that verifies if 'likes' value is missing it will defaults it to 0

    test('Defaults likes to 0 if missing', async () => {
      const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
      const token = res.body.token

      const blogWithoutLikes = {
        'title': 'Without likes',
        'author': 'Me',
        'url': 'https://examplelink.edu',
      }

      await api
        .post('/api/blogs')
        .send(blogWithoutLikes)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd[2].likes, 0)
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    })

  })

  describe('Deletion of a blog', () => {

    // Test that verifies that a specific blog can be deleted from DB

    test('A specific blog can be deleted', async () => {
      const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
      const token = res.body.token

      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })

  })

  describe('Updating and checking blogs', () => {

    // Test for checking whether each blog has a 'id' identifier and its not a '_id'

    test('The unique identifier is "id"', async () => {
      const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
      const token = res.body.token

      const response = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)

      response.body.forEach(item => {
        assert.strictEqual(Object.prototype.hasOwnProperty.call(item, 'id'), true)
      })
    })

    // Test for updating the number of likes for a blog post

    test('Number of likes in a specific blog can be updated', async () => {
      const res = await api.post('/api/login').send({ username: helper.initialUser[0].username, password: helper.initialUser[0].password })
      const token = res.body.token

      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        'title': '1 Initial title',
        'author': 'Me',
        'url': 'https://examplelink.edu',
        'likes': 999
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd[0].likes, 999)
    })

  })

})

after(async () => {
  await mongoose.connection.close()
})