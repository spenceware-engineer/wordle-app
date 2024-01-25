import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from './database/connectDB.js'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import User from './database/User.js'
import { getAndValidateWord } from './utils.js'

dotenv.config()
const app = express()

connectDB()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/**
 * @param username: string - username chosen by user
 * @param password: string - password chosen by user
 * 
 * checks for username and password, returns an array of strings indicating missing values if any
 * 
 * checks for duplicate users, returns message 'Duplicate Username' if username already exists
 * 
 * creates new user
 * 
 * generates a word to play with and returns the word for first round of play after registration
 */
app.post('/register', async (req, res) => {
  const { username, password } = req.body
  let missing = []

  if (!username) missing.push('username')
  if (!password) missing.push('password')

  if (missing.length) {
    res.status(400).json({ missing })
  }

  const duplicate = await User.findOne({ username }).exec()
  if (duplicate) return res.status(409).json({ message: 'Duplicate Username' }) //Conflict 

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = User.create({ username, password: hashedPassword })
    const firstWord = getAndValidateWord(username)
    res.status(201).json({ word: firstWord })
  } catch (e) {
    res.status(500).json(e)
  }
})

/**
 * @param username: string - username provided by user
 * @param password: string - password provided by user
 * 
 * checks for username and password, returns an array of strings indicating missing values, if any
 * 
 * checks for existance of user, if none, returns message 'Username not found'
 * 
 * validates password, if invalid, returns message 'Invalid Password.'
 * 
 * if successful login, returns word for first round of play after login
 */
app.post('/login', async (req, res) => {
  const { username, password } = req.body
  let missing = []

  if (!username) missing.push('username')
  if (!password) missing.push('password')

  if (missing.length) {
    res.status(400).json({ missing })
  }

  const authUser = User.findOne({ username }).exec()

  if (!authUser) res.status(404).json({ message: 'Username not found' })

  const passwordMatch = bcrypt.compare(password, authUser.password)

  if (!passwordMatch) res.status(403).json({ message: 'Invalid Password.' })

  const firstWord = getAndValidateWord(username)
  res.sendStatus(200).json({ word: firstWord })
})

/**
 * @param username: string - current user's username
 * gets and validates a word for next round of play
 * @returns { word: string } - word to use for next round
 */
app.get('/random-word', async (req, res) => {
  const { username } = req.body
  const word = await getAndValidateWord(username)
  res.json({ word })
})

/**
 * @param username: string - current user's username
 * @param word: string - word that was successfully completed by user
 * @returns { word: string } - new word for next round of play
 * 
 * marks completed word as completed for user
 * generates a new word for next round of play
 */
app.post('/word-completed', async (req, res) => {
  const { username, word } = req.body
  const currentUser = User.findOne({ username }).exec()
  await User.updateOne({ username }, {
    completed: [ ...currentUser.completed, word ]
  }).exec()
  const newWord = await getAndValidateWord(username)
  res.status(200).json({ word: newWord })
})

const PORT = 5000

mongoose.connection.once('open', () => {
  console.log('MongoDB connected')
  app.listen(PORT, () => {
    console.log('Server running on port', PORT)
  })
})