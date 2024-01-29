import mongoose from 'mongoose'
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  completed: {
    type: Array,
    default: [],
    required: true,
  },
})

export default mongoose.model('User', userSchema)