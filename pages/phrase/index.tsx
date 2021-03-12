import Phrase from "../../components/phrase/v1/Phrase"

const phrase = [
  {
    text: 'In the beginning,',
    indent: 0
  },
  {
    text: 'God create the heavens and the earth.',
    indent: 0
  }
]

const PhrasePage: React.FC = () => {
  return <Phrase phrase={phrase} />
}

export default PhrasePage