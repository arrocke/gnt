import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { GetStaticProps } from 'next'
import client from '../prisma/client'
import { Book, Chapter } from '@prisma/client'

interface Props {
  books: (Book & {
    chapters: Chapter[];
  })[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const books = await client.book.findMany({
    include: {
      chapters: true
    }
  })
  return {
    props: { books }
  };
}

function App(props: AppProps & Props) {
  const { Component, pageProps, books } = props
  console.log(props)
  return <Component {...pageProps} />
}

export default App
