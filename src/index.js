const express = require('express')
const thinky = require('thinky')({
    port: 38882
})

const app = express()

var Post = thinky.createModel("Post", {
    id: thinky.type.string(),
    title: thinky.type.string(),
    content: thinky.type.string()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/posts', (req, res) => {
  Post.run().then((posts) => {
    res.json(posts)
  })
})

app.get('/posts/add', (req, res) => {
  const post = new Post({
    title: "This is a test title for a test post",
    content: "This is some test content"
  })

  post.saveAll().then(() => {
    res.send("Post created")
  })
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})