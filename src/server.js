import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import connectDB from './database/connectDB.js'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import User from './database/User.js'
import { getAndValidateWord } from './utils.js'
import morgan from 'morgan'

dotenv.config()
const app = express()

connectDB()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan())

/**
 * @method POST
 * @param username: string - username chosen by user
 * @param password: string - password chosen by user
 * 
 * checks for username and password, returns an array of strings indicating missing values if any
 * 
 * checks for duplicate users, returns message 'Duplicate Username' if username already exists
 * 
 * creates new user
 * 
 * generates a word to play with and 
 * returns the word for first round of play after registration and the user's username
 */
app.post('/register', async (req, res) => {
  const { username, password } = req.body

  const duplicate = await User.findOne({ username }).exec()
  if (duplicate) return res.status(409).json({ message: 'Username already in use' })//Conflict 

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({ username, password: hashedPassword })
    const firstWord = await getAndValidateWord(username)
    return res.status(201).json({ word: firstWord, username, score: 0 })
  } catch (e) {
    return res.status(500).json(e)
  }
})

/**
 * @method GET
 * @param username: string - username provided by user
 * @param password: string - password provided by user
 * 
 * checks for username and password, returns an array of strings indicating missing values, if any
 * 
 * checks for existance of user, if none, returns message 'Username not found'
 * 
 * validates password, if invalid, returns message 'Invalid Password.'
 * 
 * if successful login, returns word for first round of play after login and the user's username
 */
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const authUser = await User.findOne({ username }).exec()
    if (!authUser) return res.status(404).json({ message: 'User not found' })

    const passwordMatch = await bcrypt.compare(password, authUser.password)
    if (!passwordMatch) return res.status(403).json({ message: 'Invalid Password' })
    const firstWord = await getAndValidateWord(username)
    return res.status(200).json({ word: firstWord, username, score: authUser.completed.length })
  } catch (e) {
    return res.status(500).json(e)
  }
})

/**
 * @method GET
 * @param username: string - current user's username
 * gets and validates a word for next round of play
 * @returns { word: string } - word to use for next round
 */
app.post('/random-word', async (req, res) => {
  const { username } = req.body
  try {
    const word = await getAndValidateWord(username)
    return res.status(200).json({ word })
  } catch (e) {
    return res.status(500).json(e)
  }
})

/**
 * @method POST
 * @param username: string - current user's username
 * @param word: string - word that was successfully completed by user
 * @returns { word: string } - new word for next round of play
 * 
 * marks completed word as completed for user
 * generates a new word for next round of play
 */
app.post('/word-completed', async (req, res) => {
  const { username, word } = req.body
  try {
    const currentUser = await User.findOne({ username }).exec()
    await User.updateOne({ username }, {
      completed: [ ...currentUser.completed, word ]
    }).exec()
    const newWord = await getAndValidateWord(username)
    return res.status(200).json({ word: newWord, score: currentUser.completed.length + 1 })
  } catch (e) {
    return res.status(500).json(e)
  }
})

const PORT = 5000

mongoose.connection.once('open', () => {
  console.log('MongoDB connected')
  app.listen(PORT, () => {
    console.log('Server running on port', PORT)
  })
})