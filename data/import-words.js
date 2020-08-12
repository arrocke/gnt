const fs = require('fs')
const path = require('path')
const es = require('event-stream')
const { PrismaClient } = require('@prisma/client')

const client = new PrismaClient()

const FIELD_REGEX = /("[^"]+"|[^",]+|)(,|$)/g
let id = 1

const s = fs.createReadStream(path.resolve(__dirname, 'words.csv'))
    .pipe(es.split())
    .pipe(es.mapSync(async (line) => {
        s.pause();

        const fields = Array.from(line.matchAll(FIELD_REGEX)).map(field => field[1].replace('"', '').replace('"',''))
        const word = {
          code: fields[0],
          book: parseInt(fields[1]),
          chapter: parseInt(fields[2]),
          verse: parseInt(fields[3]),
          speech: fields[4],
          person: fields[5],
          tense: fields[6],
          voice: fields[7],
          mood: fields[8],
          case: fields[9],
          number: fields[10],
          gender: fields[11],
          degree: fields[12],
          text: fields[13],
          word: fields[14],
          normalized: fields[15],
          lemma: fields[16]
        }
        try {
        await client.word.upsert({
          where: { id },
          update: word,
          create: word
        })
      } catch (error) {
        console.log(fields[0])
        console.log(error)
      }

        id += 1;
        s.resume();
    }))
    .on('error', function(err){
        console.log('Error while reading file.', err);
        client.$disconnect()
    })
    .on('end', function(){
        console.log('Read entire file.')
        client.$disconnect()
    })
