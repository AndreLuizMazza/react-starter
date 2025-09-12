import { Flower2, Flame, Heart } from 'lucide-react'

const BTN = 'inline-flex items-center gap-2 px-3 py-2 rounded-full border hover:opacity-90'

export default function ReactionBar({ reactions = {}, onReact }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className={`${BTN} btn-primary`} onClick={() => onReact('flores')}>
        <Flower2 className="size-4" /> Flores <span className="opacity-80">({reactions.flores || 0})</span>
      </button>
      <button className={`${BTN} btn-primary`} onClick={() => onReact('vela')}>
        <Flame className="size-4" /> Vela <span className="opacity-80">({reactions.vela || 0})</span>
      </button>
      <button className={`${BTN} btn-primary`} onClick={() => onReact('coracao')}>
        <Heart className="size-4" /> Coração <span className="opacity-80">({reactions.coracao || 0})</span>
      </button>
    </div>
  )
}
