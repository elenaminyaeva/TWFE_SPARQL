const path = require('path')
const express = require('express')
const app = express()
const port = 3000

const { Sparql, queries } = require('./sparql')

const sparql = new Sparql()

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})

app.get('/query/:id/:code', async (req, res) => {
  const { id, code } = req.params;
  res.setHeader('Content-Type', 'application/json');
  res.json(await sparql.makeQuery(queries[id](code)))
})

app.get('/query/:id', async (req, res) => {
  const { id } = req.params;
  res.setHeader('Content-Type', 'application/json');
  res.json(await sparql.makeQuery(queries[id]))
})


app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})