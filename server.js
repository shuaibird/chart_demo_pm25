const PORT = 8080
const HOST = 'http://119.29.166.125:8080'
const DATA_API = '/dataapi/view/v2'

var express = require('express')
var app = express()
var request = require('superagent')

app.use(express.static('public'))

var apiRouter = express.Router()
app.use(DATA_API, apiRouter)


apiRouter
  .get('/:view', (req, res, next) => {
    var view = req.params.view

    var dataQuery = JSON.stringify(req.query.data).replace(/\\/g, '')
    dataQuery = dataQuery.slice(1, dataQuery.length - 1)

    request
      .get(`${HOST}${DATA_API}/${view}?data=${dataQuery}`)
      .end((err, response) => res.json(response.body))
  })


app.listen(PORT, () => console.log(`OPEN: http://localhost:${PORT}`))
