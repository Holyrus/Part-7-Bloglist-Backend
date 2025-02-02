const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs[0].likes
}

const favoriteBlog = (blogs) => {
  const largest = blogs.reduce((max, obj) => {
    return obj.likes > max.likes ? obj : max
  })

  return {
    author: largest.author,
    likes: largest.likes,
    title: largest.title
  }
}

const mostBlogs = (blogs) => {

  // With using Lodash library

  // Group the blogs by author
  const groupedByAuthor = _.groupBy(blogs, 'author')

  // Map the grouped data to an array of authors with their blog counts

  const authorWithBlogCount = _.map(groupedByAuthor, (authorBlogs, author) => ({
    author,
    blogs: authorBlogs.length
  }))

  // Find the author with the maximum blogs

  return _.maxBy(authorWithBlogCount, 'blogs')

  // ---------------------------

  // Without using Lodash library

  // const nameCounts = blogs.reduce((counts, obj) => {
  //   counts[obj.author] = (counts[obj.author] || 0) + 1
  //   return counts
  // }, {})

  // let mostMentioned = { author: null, blogs: 0 }

  // for (const [author, count] of Object.entries(nameCounts)) {
  //   if (count > mostMentioned.blogs) {
  //     mostMentioned = { author, blogs: count }
  //   }
  // }

  // return mostMentioned

  // ----------------------------
}

const mostLikes = (blogs) => {

  // With using Lodash library

  // Group the blogs by author
  const groupedByAuthor = _.groupBy(blogs, 'author')

  // Map the grouped data to calculate total likes for each author

  const authorWithMostLikes = _.map(groupedByAuthor, (authorBlogs, author) => ({
    author,
    likes: _.sumBy(authorBlogs, 'likes') // Calculate the sum of likes for the author's blogs
  }))

  return _.maxBy(authorWithMostLikes, 'likes')

  // ---------------------------

  // Without using Lodash library

  // const authorSums = blogs.reduce((sums, obj) => {
  //   sums[obj.author] = (sums[obj.author] || 0) + obj.likes
  //   return sums
  // }, {})

  // let mostLikes = { author: null, likes: 0 }

  // for (const [author, sum] of Object.entries(authorSums)) {
  //   if (sum > mostLikes.likes) {
  //     mostLikes = { author, likes: sum }
  //   }
  // }

  // return mostLikes

  // -----------------------------
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}