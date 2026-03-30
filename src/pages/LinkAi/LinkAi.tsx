import { useEffect, useMemo, useRef, useState } from 'react';
import MessageInput from '../../components/LinkAi/MessageInput';
import {
  sendChatMessage,
  type ChatAction,
  type ChatHistoryItem,
  type ChatTraceStep,
} from '../../services/linkAi.service';
import { getAuthSession } from '../../utils/authSession';
import { extractErrorMessage } from '../../utils/error';
import MessageComponent from './MessageComponent';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  action?: ChatAction | null;
  trace?: ChatTraceStep[];
  animate?: boolean;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content: 'Ola, sou o Link AI. Como posso ajudar hoje?',
  action: null,
  trace: [],
  animate: false,
};

const CHAT_STORAGE_PREFIX = 'link-ai-chat-v1';
const CHAT_DRAFT_STORAGE_PREFIX = 'link-ai-chat-draft-v1';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getStorageSuffix() {
  const session = getAuthSession();
  return session?.authUsername || session?.username || 'guest';
}

function sanitizeStoredMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [INITIAL_MESSAGE];
  }

  const messages = value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const message = item as Partial<ChatMessage>;

      return {
        id: typeof message.id === 'string' ? message.id : createId('restored'),
        role: message.role === 'user' ? 'user' : 'assistant',
        content: typeof message.content === 'string' ? message.content : '',
        action:
          message.action && typeof message.action === 'object'
            ? message.action
            : null,
        trace: Array.isArray(message.trace) ? message.trace : [],
        animate: false,
      } satisfies ChatMessage;
    })
    .filter((message) => message.content.trim())
    .slice(-50);

  return messages.length ? messages : [INITIAL_MESSAGE];
}

function loadStoredMessages(storageKey: string) {
  if (typeof window === 'undefined') {
    return [INITIAL_MESSAGE];
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return [INITIAL_MESSAGE];
  }

  try {
    return sanitizeStoredMessages(JSON.parse(rawValue));
  } catch {
    return [INITIAL_MESSAGE];
  }
}

function loadStoredDraft(storageKey: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(storageKey) || '';
}

function buildPreviewSteps(message: string) {
  const normalizedMessage = message.toLowerCase();
  const isBuildRequest =
    normalizedMessage.includes('build') ||
    normalizedMessage.includes('download') ||
    normalizedMessage.includes('zip') ||
    (normalizedMessage.includes('gerar') &&
      (normalizedMessage.includes('app') ||
        normalizedMessage.includes('aplicacao') ||
        normalizedMessage.includes('projeto')));

  if (isBuildRequest) {
    return ['Criando o build da aplicacao.'];
  }

  if (
    normalizedMessage.includes('integracao') ||
    normalizedMessage.includes('instalar')
  ) {
    return ['Preparando a integracao solicitada.'];
  }

  if (
    normalizedMessage.includes(' ia ') ||
    normalizedMessage.startsWith('ia ') ||
    normalizedMessage.includes('assistente') ||
    normalizedMessage.includes('criar ia')
  ) {
    return ['Configurando a IA solicitada.'];
  }

  return [];
}

function mapMessagesToHistory(messages: ChatMessage[]): ChatHistoryItem[] {
  return messages
    .filter((message) => message.content.trim())
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
    .slice(-10);
}

export default function LinkAi() {
  const storageSuffix = useMemo(() => getStorageSuffix(), []);
  const chatStorageKey = `${CHAT_STORAGE_PREFIX}:${storageSuffix}`;
  const draftStorageKey = `${CHAT_DRAFT_STORAGE_PREFIX}:${storageSuffix}`;
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [composerHeight, setComposerHeight] = useState(108);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadStoredMessages(chatStorageKey),
  );
  const [messageInput, setMessageInput] = useState(() =>
    loadStoredDraft(draftStorageKey),
  );
  const [isSending, setIsSending] = useState(false);
  const [thinkingDots, setThinkingDots] = useState('.');
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [visibleThinkingSteps, setVisibleThinkingSteps] = useState<string[]>(
    [],
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, visibleThinkingSteps.length, isSending, composerHeight]);

  useEffect(() => {
    setMessages(loadStoredMessages(chatStorageKey));
    setMessageInput(loadStoredDraft(draftStorageKey));
  }, [chatStorageKey, draftStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const persistedMessages = messages
      .map((message) => ({
        ...message,
        animate: false,
      }))
      .slice(-50);

    window.localStorage.setItem(
      chatStorageKey,
      JSON.stringify(persistedMessages),
    );
  }, [chatStorageKey, messages]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!messageInput.trim()) {
      window.localStorage.removeItem(draftStorageKey);
      return;
    }

    window.localStorage.setItem(draftStorageKey, messageInput);
  }, [draftStorageKey, messageInput]);

  useEffect(() => {
    if (!isSending) {
      setThinkingDots('.');
      setVisibleThinkingSteps([]);
      return;
    }

    setVisibleThinkingSteps(thinkingSteps.slice(0, 1));

    const dotsInterval = window.setInterval(() => {
      setThinkingDots((currentValue) =>
        currentValue.length >= 3 ? '.' : `${currentValue}.`,
      );
    }, 350);

    const stepsInterval = window.setInterval(() => {
      setVisibleThinkingSteps((currentValue) => {
        if (currentValue.length >= thinkingSteps.length) {
          return currentValue;
        }

        return thinkingSteps.slice(0, currentValue.length + 1);
      });
    }, 1100);

    return () => {
      window.clearInterval(dotsInterval);
      window.clearInterval(stepsInterval);
    };
  }, [isSending, thinkingSteps]);

  useEffect(() => {
    function handleTabFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab' || event.defaultPrevented) {
        return;
      }

      const activeElement = document.activeElement;
      const target = event.target as HTMLElement | null;
      const isInsideInteractiveElement = Boolean(
        target?.closest('input, textarea, button, a, [tabindex]:not([tabindex="-1"])'),
      );
      const inputElement = messageInputRef.current;

      if (
        !inputElement ||
        inputElement.disabled ||
        isInsideInteractiveElement ||
        activeElement === inputElement
      ) {
        return;
      }

      event.preventDefault();
      inputElement.focus();
    }

    window.addEventListener('keydown', handleTabFocus);

    return () => {
      window.removeEventListener('keydown', handleTabFocus);
    };
  }, []);

  async function handleSubmit() {
    const trimmedMessage = messageInput.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      content: trimmedMessage,
      action: null,
      trace: [],
      animate: false,
    };

    const optimisticMessages = [...messages, nextUserMessage];

    setMessages(optimisticMessages);
    setMessageInput('');
    setThinkingSteps(buildPreviewSteps(trimmedMessage));
    setIsSending(true);

    try {
      const session = getAuthSession();
      const response = await sendChatMessage({
        message: trimmedMessage,
        history: mapMessagesToHistory(optimisticMessages),
        sessionContext: {
          authUsername: session?.authUsername,
          authPassword: session?.authPassword,
          operatorName: session?.username,
        },
      });

      const assistantMessage: ChatMessage = {
        id: createId('assistant'),
        role: 'assistant',
        content: response.reply,
        action: response.action,
        trace: response.trace,
        animate: true,
      };

      setMessages((currentValue) => [...currentValue, assistantMessage]);
    } catch (error) {
      setMessages((currentValue) => [
        ...currentValue,
        {
          id: createId('assistant-error'),
          role: 'assistant',
          content: extractErrorMessage(
            error,
            'Nao consegui concluir a solicitacao agora.',
          ),
          action: null,
          trace: [
            {
              id: createId('trace-error'),
              message: 'Falha ao processar a solicitacao no backend.',
              status: 'error',
            },
          ],
          animate: false,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="flex h-full w-full flex-col overflow-hidden p-5 text-2xl font-bold text-gray-700">
      <h1 className="pb-4">Link AI</h1>
      <section
        ref={scrollContainerRef}
        className="scrollbar-minimal flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-2"
        style={{
          paddingBottom: `${composerHeight + 40}px`,
        }}
      >
        {messages.map((message) => (
          <MessageComponent
            key={message.id}
            role={message.role}
            content={message.content}
            action={message.action}
            trace={message.trace}
            animate={message.animate}
            onContentProgress={scrollToBottom}
          />
        ))}

        {isSending ? (
          <MessageComponent
            role="assistant"
            isThinking={true}
            thinkingLabel={`Pensando${thinkingDots}`}
            thinkingSteps={visibleThinkingSteps}
          />
        ) : null}
      </section>

      <MessageInput
        value={messageInput}
        disabled={isSending}
        onChange={setMessageInput}
        onSubmit={handleSubmit}
        inputRef={messageInputRef}
        onHeightChange={setComposerHeight}
      />
    </main>
  );
}
