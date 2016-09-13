const PORT = 8080
const HOST = 'http://119.29.166.125:8080'

var express = require('express')
var app = express()
var request = require('superagent')

app.use(express.static('public'))

request
  .get(`${HOST}/dataapi/view/v2/AVZa1KdFwe2Jxq0nEb01?data={"PRODUCT_KEY":"pk1","DID":"did1","FROM_TIMESTAMP_MILLIS":1473468218123,"TO_TIMESTAMP_MILLIS":1473557618123}`)
  .end((err, res) => {
    console.log(res.body)
  })

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
