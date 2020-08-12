const fs = require('fs/promises')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const client = new PrismaClient()

const FIELD_REGEX = /("[^"]+"|[^",]+|)(,|$)/g

async function processList(file, fn) {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf-8')
  const items = data.split('\n')
  let id = 1
  for (const item of items) {
    await fn(item, id++)
  }
  console.log(`imported ${file}`)
}

// processList('lemmas.csv', (title, id) => client.lemma.upsert({
//   where: { id },
//   update: { title },
//   create: { title }
// })).then(() => 
  processList('words.csv', async (data, id) => {
    let match
    const fields = []
    while ((match = FIELD_REGEX.exec(data)) !== null) {
      fields.push(match[0].replace('"', ''))
    }
    console.log(`Importing fields[0]`)
    const word = {
      code: fields[1],
      text: fields[14],
      word: fields[15],
      normalized: fields[16],
      lemma: fields[17]
    }
    await client.word.upsert({
      where: { id },
      update: word,
      create: word
    })
  })
.then(() => 
  client.$disconnect()
)


