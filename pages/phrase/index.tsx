import Phrase from "../../components/phrase/v2/Phrase"

const phrase = [
  {
    id: 0,
    text: 'In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.',
    indent: 0
  }
]

const PhrasePage: React.FC = () => {
  
  return (
    <div>
      <Phrase phrase={phrase} />
    </div>
  )
}

export default PhrasePage