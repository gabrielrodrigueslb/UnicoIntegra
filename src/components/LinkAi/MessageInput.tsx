import { ArrowUp} from 'lucide-react'

export default function MessageInput() {
  return (
    <div className=' flex px-6 py-4 rounded-lg bg-primary-foreground fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-3xl shadow-2xl  border-border border-2 '>
        <input className='text-foreground text-[18px] font-normal flex-1 border-0 outline-0' type="text" placeholder='Como posso ajudar você hoje?' />
        <button className='bg-primary text-primary-foreground p-3 rounded-full'><ArrowUp size={25}/></button>
    </div>
  )
}
