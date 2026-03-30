import MessageInput from '../../components/LinkAi/MessageInput';
import MessageComponent from './MessageComponent';

export default function LinkAi() {
  return (
    <main className="w-full h-full flex flex-col text-2xl font-bold text-gray-700 p-5">
      <h1 className="pb-4">Link AI</h1>
      <section className="flex flex-col shrink px-6 py-2 gap-5">
        <MessageComponent isAi={true} />
        <MessageComponent isAi={false} />
        
      </section>
      <MessageInput />
    </main>
  );
}
