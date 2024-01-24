import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './database/connectDB.js'

dotenv.config()
const app = express()

connectDB()

app.get('/random-word', async (_, res) => {
  const result = await fetch('https://random-word.ryanrk.com/api/en/word/random/?minlength=5&maxlength=5')
  const data = await result.json()
  res.send(data[ 0 ])
})

const PORT = 5000

mongoose.connection.once('open', () => {
  console.log('MongoDB connected')
  app.listen(PORT, () => {
    console.log('Server running on port', PORT)
  })
})