import monk from 'monk'

const connectionString = process.env.MONGO_URI
if (!connectionString) {
  throw new Error('MONGO_URI not defined')
}

export const db = monk(connectionString)

db.then(() => {
  console.info('connected to mongo')
})