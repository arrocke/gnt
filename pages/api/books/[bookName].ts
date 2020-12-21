import { ParagraphWhereInput } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import client from '../../../prisma/client'

const DEFAULT_PAGE_SIZE = 5
const MAX_PAGE_SIZE = 20

function getPageSize(query: { [key: string]: string | string[] }) {
  const queryStringValue = query['page[size]']
  const queryValue = Array.isArray(queryStringValue) ? queryStringValue[0] : queryStringValue
  if (queryValue) {
    const parsedValue = parseFloat(queryValue)
    if (typeof parsedValue !== 'number' || parsedValue <= 0 || parsedValue % 1 !== 0) {
      return {
        error: {
          "title": "Invalid Parameter.",
          "detail": "page[size] must be a positive integer",
          "source": { "parameter": "page[size]" },
        }
      }
    } else if (parsedValue > MAX_PAGE_SIZE) {
      return {
        error: {
          "meta": {
            "page": { "maxSize": MAX_PAGE_SIZE }
          },
          "title": "Page size requested is too large.",
          "detail": `max page size is ${MAX_PAGE_SIZE}`,
          "source": {
            "parameter": "page[size]"
          },
          "links": {
            "type": ["https://jsonapi.org/profiles/ethanresnick/cursor-pagination/max-size-exceeded"]
          }
        }
      }
    } else {
      return { value: parsedValue }
    }
  } else {
    return { value: DEFAULT_PAGE_SIZE }
  }
}

function getCursor(label: string, query: { [key: string]: string | string[] }) {
  const queryLabel = `page[${label}]`
  const queryStringValue = query[queryLabel]
  const queryValue = Array.isArray(queryStringValue) ? queryStringValue[0] : queryStringValue
  if (queryValue) {
    const parsedValue = parseFloat(queryValue)
    if (typeof parsedValue !== 'number' || parsedValue < 0 || parsedValue % 1 !== 0) {
      return {
        error: {
          "title": "Invalid Parameter.",
          "detail": `${queryLabel} must be a whole number`,
          "source": { "parameter": queryLabel },
        }
      }
    } else {
      return { value: parsedValue }
    }
  } else {
    return {}
  }
}

function verifyCursors(start?: number, end?: number) {
  if (start && end) {
    return {
      error: {
        "title": "Range pagination not supported",
        "detail": 'you must specify only one of page[start] and page[end]',
        "links": {
          "type": ["https://jsonapi.org/profiles/ethanresnick/cursor-pagination/range-pagination-not-supported"]
        }
      }
    }
  } else {
    return {}
  }
}

function getReference(query: { [key: string]: string | string[] }) {
  const queryStringValue = query['reference'] as string
  const queryValue = Array.isArray(queryStringValue) ? queryStringValue[0] : queryStringValue

  if (!queryValue) {
    return {}
  }

  const match = /^(\d+):(\d+)/i.exec(queryValue)
  if (match) {
    const chapterNumber = parseInt(match[0])
    const verseNumber = parseInt(match[1])
    if (chapterNumber > 0 && verseNumber > 0) {
      return { value: [chapterNumber, verseNumber] }
    }
  }
  return {
    error: {
      "title": "Invalid Parameter",
      "detail": "reference must be a valid chapter and verse reference",
      "source": { "parameter": "reference" },
    }
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const pageSizeResult = getPageSize(req.query)
  const startCursorResult = getCursor('start', req.query)
  const endCursorResult = getCursor('end', req.query)
  const verifyCursorsResult = verifyCursors(startCursorResult.value, endCursorResult.value)
  const referenceResult = getReference(req.query)

  const errors = [
    pageSizeResult.error,
    startCursorResult.error,
    endCursorResult.error,
    verifyCursorsResult.error,
    referenceResult.error,
  ].filter(result => result)

  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }

  const pageSize = pageSizeResult.value || DEFAULT_PAGE_SIZE
  const startCursor = startCursorResult.value
  const endCursor = endCursorResult.value
  const bookName = (req.query.bookName as string).replace('-', ' ')
  const reference = referenceResult.value

  const paragraphQuery: ParagraphWhereInput = {
    book: { name: bookName }
  }

  if (reference) {
    const [{ verses: [verse] = [] } = {}] = await client.book.findOne({
      where: {
        name: bookName 
      }
    }).chapters({
      where: {
        number: reference[0]
      },
      select: {
        verses: {
          where: {
            number: reference[1]
          },
          select: {
            words: {
              take: 1,
              select: {
                paragraphId: true
              }
            }
          }
        }
      }
    })
    if (verse) {
      console.log(verse)
      paragraphQuery.id = { gt: verse.words[0].paragraphId }
    } else {
      res.status(400).end()
    }
  } else if (startCursor) {
    paragraphQuery.id = { gt: startCursor }
  } else if (endCursor) {
    paragraphQuery.id = { gt: endCursor - pageSize - 1 }
  }

  const content = await client.paragraph.findMany({
    where: paragraphQuery,
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
    take: pageSize
  })

  res.status(200).json({ data: content })
}


