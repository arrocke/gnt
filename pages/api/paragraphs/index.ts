import url from 'url';
import { ParagraphWhereInput } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import client from '../../../prisma/client'

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 15
const REFERENCE_REGEX = /^((?:[12]-)?[a-zA-Z]+)-(\d+):(\d+)$/

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const limit = Math.max(0, Math.min(
    MAX_LIMIT,
    parseInt(req.query.limit as string) || DEFAULT_LIMIT
  ))
  const reference = REFERENCE_REGEX.exec((req.query.reference as string))
  const next = parseInt(req.query.next as string)

  const query: ParagraphWhereInput = {}

  // Convert the reference to the first paragraph that includes it.
  if (reference) {
    const book = reference[1].toLowerCase().replace('-', ' ')
    const chapter = parseInt(reference[2])
    const verse = parseInt(reference[3])
    if (!(chapter > 0 && verse > 0)) {
      return res.status(400).json({
        error: 'reference must be in the form: <book>-<chapter>:<verse>'
      })
    }

    const [start] = await client.text.findMany({
      where: {
        book,
        chapter,
        verseNumber: verse
      },
      orderBy: {
        paragraphId: 'asc'
      },
      take: 1
    })

    if (!start) {
      return res.status(200).json([])
    }

    query.id = { gte: start.paragraphId }
  }

  else if (next >= 1) {
    query.id = { gte: next }
  }

  const content = await client.paragraph.findMany({
    where: query,
    select: {
      id: true,
      text: {
        select: {
          id: true,
          chapter: true,
          verseNumber: true,
          text: true,
          lemma: true,
          speech: true,
          parsing: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    },
    take: limit
  })

  const nextId = content.slice(-1)[0].id + 1
  const currentId = content[0].id
  const previousId = currentId - limit

  res.status(200).json({
    previous: `${url.parse(req.url || '').pathname}?next=${previousId}`,
    current: `${url.parse(req.url || '').pathname}?next=${currentId}`,
    next: `${url.parse(req.url || '').pathname}?next=${nextId}`,
    data: content,
  })
}

