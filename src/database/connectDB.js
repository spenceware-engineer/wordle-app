import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
  } catch (e) {
    console.error(e)
  }
}

export default connectDB