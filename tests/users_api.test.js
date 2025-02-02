const { test, describe, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const helper = require('./test_helper')

const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')

// npm test -- tests/users_api.test.js

describe('When there is initially one user in DB', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('SekretBig11', 10)
    const user = new User({
      username: 'NewUsername',
      passwordHash
    })
    await user.save()
  })

  test('Creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Anukasosi',
      name: 'Ruslan Mumchikovich',
      password: 'Verusik11233'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  // Test that verifies that a new user with the same username can not be created
  test('Creation fails with proper status and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'NewUsername',
      name: 'Superuser',
      password: 'Pupsik13144'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

// Tests that ensures invalid users are not created
describe('Invalid users are not created', () => {

  test('Creation fails with proper status code if username is invalid', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalidUsername = {
      username: 'Po', // Username shorter than 8 characters long
      name: 'Foofff',
      password: 'Pupsik3434'
    }

    const result = await api
      .post('/api/users')
      .send(invalidUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('User validation failed:'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails with proper status code if password smaller than 8 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const shortPassword = {
      username: 'Validusername',
      name: 'Pupsik',
      password: 'Pup23' // Password valid but shorter than 8 characters
    }

    await api
      .post('/api/users')
      .send(shortPassword)
      .expect(500)
      .expect('Content-Type', /text\/html/)

    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails with proper status code if password not contain at least one lowercase letter', async () => {
    const usersAtStart = await helper.usersInDb()

    const noLowercasePassword = {
      username: 'Validusername',
      name: 'Pupsik',
      password: 'PPPDFFF23' // Password valid but swithout lowercase letters
    }

    await api
      .post('/api/users')
      .send(noLowercasePassword)
      .expect(500)
      .expect('Content-Type', /text\/html/)

    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails with proper status code if password not contain at least one uppercase letter', async () => {
    const usersAtStart = await helper.usersInDb()

    const noUppercasePassword = {
      username: 'Validusername',
      name: 'Pupsik',
      password: 'asdfafd234234' // Password valid but swithout uppercase letters
    }

    await api
      .post('/api/users')
      .send(noUppercasePassword)
      .expect(500)
      .expect('Content-Type', /text\/html/)

    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Creation fails with proper status code if password not contain at least one number', async () => {
    const usersAtStart = await helper.usersInDb()

    const noNumberPassword = {
      username: 'Validusername',
      name: 'Pupsik',
      password: 'FDFfgfgdfg' // Password valid but swithout numbers
    }

    await api
      .post('/api/users')
      .send(noNumberPassword)
      .expect(500)
      .expect('Content-Type', /text\/html/)

    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

})

after(async () => {
  await mongoose.connection.close()
})