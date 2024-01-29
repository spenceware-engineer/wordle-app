import fetch from 'node-fetch'
import User from './database/User.js'

/**
 * finds the current user and checks if the word has already been completed
 * returns a boolean indicating whether the word has (true) or has not (false) been completed already
 * @param {string} username - username of current user
 * @param {string} word - word to be checked against completed words for user
 * @returns boolean
 */
const isWordCompleted = async (username, word) => {
  const currentUser = await User.findOne({ username })
  if (currentUser.completed.includes(word)) return true
  return false
}

/**
 * gets a random word, checks ifit is valid and if the word has been completed
 * returns the random word only if it is valid and has not been completed before
 * @param {string} username - username of current user
 * @returns string
 */
export const getAndValidateWord = async (username) => {
  let result = await fetch(
    'https://wordsapiv1.p.rapidapi.com/words/?letters=5&random=true',
    {
      headers: {
        'X-RapidAPI-Key': process.env.WORDS_API_KEY,
        'X-RapidAPI-Host': process.env.WORDS_API_HOST,
      }
    }
  )
  let { word } = await result.json()
  while (await isWordCompleted(username, word)) {
    result = await fetch(
      'https://wordsapiv1.p.rapidapi.com/words/?letters=5&random=true',
      {
        headers: {
          'X-RapidAPI-Key': process.env.WORDS_API_KEY,
          'X-RapidAPI-Host': process.env.WORDS_API_HOST,
        }
      }
    )
    let data = await result.json()
    word = data.word
  }
  return word
}