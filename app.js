const express = require('express')
const app = express()
const cors = require('cors')
const connectOffChainDb = require('./config/database.config')


require('dotenv').config()

app.use(cors())
app.use(express.json())

connectOffChainDb()


module.exports = app;