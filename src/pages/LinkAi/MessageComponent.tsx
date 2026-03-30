import { Bot, User } from 'lucide-react'

type Props = {
  isAi?: boolean
}
    
export default function MessageComponent({ isAi }: Props) {
  return (
    <>
    {isAi === true ? (<div className='flex items-start gap-4 self-start'>
          <span className="p-2 inline-block bg-primary-foreground rounded-full text-primary shadow border-border border-2">
            <Bot />
          </span>
          <div className="w-full max-w-[550px] h-auto bg-primary-foreground rounded-xl rounded-tl-none p-6 border-border border-2">
          <p className="text-foreground text-[18px] font-normal ">
            Olá! Eu sou o Link IA, seu assistente inteligente integrado ao
            Unico. Estou aqui para ajudar você a navegar, configurar e
            aproveitar ao máximo todas as funcionalidades do Unico.
          </p>
        </div>
        </div>) : (<div className='flex flex-row-reverse items-start gap-4 self-end'>
          <span className="p-2 inline-block bg-primary-foreground rounded-full text-red shadow border-border border-2">
            <User />
          </span>
          <div className="w-full max-w-[550px] h-auto bg-primary rounded-xl rounded-tr-none p-6">
          <p className="text-primary-foreground text-[18px] font-normal ">
            Olá! Link, tudo bem? Preciso de ajuda para configurar uma nova integração com a API de clima.
          </p>
        </div>
        </div>)}
    </>
    
  )
}
