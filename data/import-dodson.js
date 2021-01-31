const { PrismaClient } = require('@prisma/client')
const xml2js = require('xml2js')
const fs = require('fs')

const client = new PrismaClient()

const file = fs.readFileSync('./data/dodson.xml')
xml2js.parseString(file, async (err, data) => {
  const lemmas = await client.lemma.findMany({ orderBy: { id: 'asc' }})
  let errors = 0
  for (const entry of data.TEI.entry) {
    const lemma = entry.$.n.split(' | ')[0].trim()
    const strongs = parseInt(entry.$.n.split(' | ')[1])
    const orth = entry.orth[0]
    const brief = entry.def[0]._
    const description = entry.def[1]._
    const lemmaObj = lemmas.find(l =>
      l.title.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('el')
      === lemma.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('el')
    )
    if (lemmaObj) {
      try {
        await client.lemma.update({
          where: {
            id: lemmaObj.id
          },
          data: {
            title: lemma,
            strongs,
            fullLemma: orth,
            brief,
            description
          }
        })
      } catch (error) {
        console.log(`ERROR on ${strongs} ${lemma}`)
        console.log(error)
        console.log(orth)
      }
    } else {
      console.log(strongs, lemma)
      errors++
    }
  }
  console.log(errors)

  client.$disconnect()
})
