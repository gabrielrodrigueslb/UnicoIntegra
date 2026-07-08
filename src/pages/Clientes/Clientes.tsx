import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash,
} from 'lucide-react';
import { BiExport } from 'react-icons/bi';

export default function Clientes() {
  return (
    <main className="w-full p-6">
      <header className="flex justify-between items-center pb-6">
        <span>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-[#90A1B9] text-sm">Gerenciar bancos de clientes</p>
        </span>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border-2 border-[#155DFC] text-[#155DFC] rounded-[6px] flex items-center gap-1 font-medium">
            <BiExport /> Exportar
          </button>
          <button className="bg-[#155DFC] px-4 py-2 rounded-[6px] text-white flex items-center gap-1 font-medium">
            {' '}
            <Plus size={18} /> Novo Cliente
          </button>
        </div>
      </header>
      <nav className="flex flex-1 border-b-2 border-[#155DFC]/10 mb-6">
        <ul className="flex gap-4">
          <li className="flex items-center gap-1 px-4 py-1.5 border-b-3 font-medium border-[#155DFC] select-none cursor-pointer text-sm text-[#155DFC]">
            Todos{' '}
            <span className="inline-flex size-5 items-center justify-center text-xs bg-[#155DFC]/10 rounded-[4px]">
              12
            </span>
          </li>
          <li className="flex items-center gap-1 px-4 py-1.5 border-b-3 text-[#90A1B9] border-[#155DFC]/0 select-none cursor-pointer font-medium text-sm">
            Criados{' '}
            <span className="inline-flex size-5 items-center justify-center text-xs bg-[#155DFC]/10 rounded-[4px]">
              12
            </span>
          </li>
          <li className="flex items-center gap-1 px-4 py-1.5 border-b-3 text-[#90A1B9] border-[#155DFC]/0 select-none cursor-pointer font-medium text-sm">
            Em setup{' '}
            <span className="inline-flex size-5 items-center justify-center text-xs bg-[#155DFC]/10 rounded-[4px]">
              12
            </span>
          </li>
          <li className="flex items-center gap-1 px-4 py-1.5 border-b-3 text-[#90A1B9] border-[#155DFC]/0 select-none cursor-pointer font-medium text-sm">
            Ativos
            <span className="inline-flex size-5 items-center justify-center text-xs bg-[#155DFC]/10 rounded-[4px]">
              12
            </span>
          </li>
        </ul>
      </nav>
      <section>
        <div className="flex justify-between items-center gap-2 mb-6">
          <span className="border border-primary/10 flex items-center gap-2 px-4 rounded-[6px] max-w-[350px] w-full ">
            <Search size={16} />
            <input
              type="text"
              className="outline-none flex flex-1 py-2 text-sm"
              placeholder="Pesquisar clientes..."
            />
          </span>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              className="outline-none border border-primary/15 py-2 px-3 text-sm rounded-[8px] cursor-pointer"
            />
            <button className="flex gap-1 items-center px-4 py-2 border border-primary/10 rounded-[6px] text-sm">
              <Filter size={14} /> Filtros
            </button>
          </div>
        </div>
        <section className="border-[2px] border-[#155DFC]/10 rounded-[8px] overflow-hidden ">
          <table className="flex flex-col flex-1">
            <thead className="bg-[#F9F9FB]">
              <tr className="flex flex-1  items-center border-b border-primary/10 py-2 text-sm text-[#373C43]">
                <th className='font-semibold w-[10%]'>ID</th>
                <th className='font-semibold w-[30%]'>Nome</th>
                <th className='font-semibold w-[30%]'>InstÃ¢ncia</th>
                <th className='font-semibold w-[10%]'>Porcentagem</th>
                <th className='font-semibold w-[25%]'>AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody>
              <tr className='flex flex-1  items-center border-b border-primary/10  text-sm text-[#373C43] py-2'>
                <td className='w-[10%] h-full py-2 text-center'>1</td>
                <td className='w-[30%] h-full py-2 text-center'>John Doe</td>
                <td className='w-[30%] h-full py-2 text-center'>InstÃ¢ncia 1</td>
                <td className='w-[10%] h-full py-2 text-center'>100%</td>
                <td className='w-[25%] h-full  text-center flex gap-2 justify-center gap-[5px]'>
                  <button className='text-[#373C43] hover:text-primary/80 p-2 rounded-[6px] border border-primary/10
                  '>
                    <Eye size={18} />
                  </button>
                  <button className='text-[#373C43] hover:text-primary/80 p-2 rounded-[6px] border border-primary/10
                  '>
                    <Pencil size={18} />
                  </button>
                  <button className='text-red-400 hover:text-red-400/80 p-2 rounded-[6px] border border-primary/10
                  '>
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <footer className='flex items-center justify-between px-4 py-2'>
            <span className='text-sm text-[#373C43]'>Mostrando 1 de 1 clientes</span>
            <div className='flex items-center gap-3'>
              <button className='flex items-center gap-1 px-4 py-2 text-sm text-[#373C43] border-primary/20 border rounded-[6px]'>
                <ArrowLeft size={16} /> Anterior
              </button>
              <span className='flex items-center gap-1 px-4 py-2 text-sm text-[#373C43] border-primary/20 border rounded-[6px]'>1</span>
              <button className='flex items-center gap-1 px-4 py-2 text-sm text-[#373C43] border-primary/20 border rounded-[6px]'>
                PrÃ³ximo <ArrowRight  size={16}/>
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  );
}
