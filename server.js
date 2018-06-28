
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const chatkit = require('@pusher/chatkit-server')

var app = express()

const ck = new chatkit.default({
    instanceLocator : process.env.IL,
    key : process.env.KEY

})
//used to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}))
//parses application/json object
app.use(bodyParser.json())
app.use(cors())


app.post('/users', (req, res) => {
  const { username } = req.body
  chatkit
    .createUser({
      id: username,
      name: username
    })
    .then(() => {
      console.log(`User created: ${username}`)
      res.sendStatus(201)
    })
    .catch(err => {
      if (err.error === 'services/chatkit/user_already_exists') {
        console.log(`User already exists: ${username}`)
        res.sendStatus(200)
      } else {
        res.status(err.status).json(err)
      }
    })
})

app.post('/authenticate', (req, res) => {
  const authData = chatkit.authenticate({ userId: req.query.user_id })
  res.status(authData.status).send(authData.body)
})

const port = 3001
app.listen(port, err => {
  if (err) {
    console.log(err)
  } else {
    console.log(`Running on port ${port}`)
  }
})
