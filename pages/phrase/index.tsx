import Phrase from "../../components/phrase/v2/Phrase"

const phrase = [
  {
    id: 0,
    text: 'In the beginning',
    indent: 0
  },
  {
    id: 1,
    text: 'God created the heavens and the earth.',
    indent: 0
  },
  {
    id: 2,
    text: 'Now the earth was formless and empty,',
    indent: 0
  },
  {
    id: 3,
    text: 'darkness was over the surface of the deep,',
    indent: 0
  },
  {
    id: 4,
    text: 'and the Spirit of God was hovering over the waters.',
    indent: 0
  }
]

const PhrasePage: React.FC = () => {
  
  return (
    <div>
      <button>Focus 1</button>
      <Phrase phrase={phrase} />
      <button>Focus 2</button>
    </div>
  )
}

export default PhrasePage