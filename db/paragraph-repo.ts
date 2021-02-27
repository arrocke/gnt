import { db } from './connect'

const DEFAULT_LIMIT = 5
const DEFAULT_START_CURSOR = 0

export interface FindParagraphsQuery {
  book: string
  startCursor?: number
  endCursor?: number
  limit?: number
}

export interface Reference { 
  book: string,
  chapter: number,
  verse: number
}

export interface Paragraph {
  _id: number,
  words: {
    chapter: number,
    verse: number,
    paragraph: number,
    text: string,
    parsing: string,
    definition: string,
    strongs: number,
    normalized: string
  }[]
}

export interface Page<T> {
  data: T[],
  nextCursor?: number
  prevCursor?: number
}

export const paragraphRepo = {
  async findParagraphIdByReference(reference: Reference): Promise<number | undefined> {
    const data = await db.get('books').aggregate<{ paragraph: number }[]>([
      { $match: { name: reference.book } },
      { $unwind: { path: '$words' } },
      { $replaceRoot: { newRoot: '$words' } },
      {
        $match: {
          chapter: reference.chapter,
          verse: reference.verse
        }
      },
      { $limit: 1 },
      { $project: { paragraph: 1 } }
    ])
    return data[0]?.paragraph
  },

  async findParagraphs(query: FindParagraphsQuery): Promise<Page<Paragraph>> {
    const limit = query.limit ?? DEFAULT_LIMIT 
    const startCursor =
      query.startCursor ?? (query.endCursor ? (query.endCursor - limit - 1) : DEFAULT_START_CURSOR)
    const endCursor =
      query.endCursor ?? (startCursor + limit + 1)

    const result = await db.get('books').aggregate<{ data: Paragraph[], next: object[], prev: object[] }[]>([
      { $match: { name: query.book } },
      { $unwind: { path: '$words' } },
      {
        $facet: {
          data: [
            {
              $match: {
                'words.paragraph': {
                  $gt: startCursor,
                  $lt: endCursor
                }
              }
            },
            { 
              $replaceRoot: {
                newRoot: '$words'
              }
            },
            {
              $lookup: {
                from: 'lemmas',
                foreignField: '_id',
                localField: 'lemma',
                as: 'lemma'
              }
            },
            {
              $unwind: {
                path: '$lemma',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                chapter: 1,
                verse: 1,
                paragraph: 1,
                text: 1,
                parsing: 1,
                definition: '$lemma.brief',
                normalized: '$lemma.title',
                strongs: '$lemma.strongs',
              }
            },
            { 
              $group: {
                _id: '$paragraph',
                words: {
                  $push: '$$ROOT'
                }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Determine if there are paragraphs before and after the queried ones.
          prev: [
            { $match: { 'words.paragraph': startCursor } },
            { $limit: 1 },
            { $project: { hasMore: { $literal: true } } }
          ],
          next: [
            { $match: { 'words.paragraph': endCursor } },
            { $limit: 1 },
            { $project: { hasMore: { $literal: true } } }
          ]
        }
      },
    ])

    let [{ data, next, prev }] = result

    return {
      data,
      ...(next.length > 0 && ({ nextCursor: endCursor - 1 })),
      ...(prev.length > 0 && ({ prevCursor: startCursor + 1 })),
    }
  }
}