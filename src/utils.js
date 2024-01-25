import fetch from 'node-fetch'
import User from './database/User.js'

/**
 * checks Dictionary API for word to make sure it is an English word
 * returns a boolean indicating whether it is a valid English word (true) or not (false)
 * @param {string} word - word to be validated
 * @returns boolean
 */
const isValidWord = async (word) => {
  const result = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
  const data = await result.json()
  if (data.title) return false
  return true
}

/**
 * finds the current user and checks if the word has already been completed
 * returns a boolean indicating whether the word has (true) or has not (false) been completed already
 * @param {string} username - username of current user
 * @param {string} word - word to be checked against completed words for user
 * @returns boolean
 */
const isWordCompleted = async (username, word) => {
  const currentUser = await User.findOne({username})
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
  let result = await fetch('https://random-word.ryanrk.com/api/en/word/random/?minlength=5&maxlength=5')
  let data = await result.json()
  while (!(await isValidWord(data[ 0 ])) || isWordCompleted(username, data[ 0 ])) {
    result = await fetch('https://random-word.ryanrk.com/api/en/word/random/?minlength=5&maxlength=5')
    data = await result.json()
  }
  return data[ 0 ]
}