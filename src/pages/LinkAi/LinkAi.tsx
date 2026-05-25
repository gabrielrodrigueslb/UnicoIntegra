import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquareText, Plus, Trash2, X } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import MessageInput from '../../components/LinkAi/MessageInput';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import {
  sendChatMessageStream,
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
  actions?: ChatAction[];
  trace?: ChatTraceStep[];
  animate?: boolean;
};

type ChatConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  draft: string;
};

type StoredConversationState = {
  conversations: ChatConversation[];
  activeConversationId: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content: 'Ola, sou o Link AI. Como posso ajudar hoje?',
  action: null,
  actions: [],
  trace: [],
  animate: false,
};

const LEGACY_CHAT_STORAGE_PREFIX = 'link-ai-chat-v1';
const LEGACY_DRAFT_STORAGE_PREFIX = 'link-ai-chat-draft-v1';
const CONVERSATIONS_STORAGE_PREFIX = 'link-ai-conversations-v1';
const ACTIVE_CONVERSATION_STORAGE_PREFIX = 'link-ai-active-conversation-v1';
const MAX_PERSISTED_MESSAGES = 50;
const MAX_CONVERSATIONS = 30;
const DEFAULT_CONVERSATION_TITLE = 'Nova conversa';
const CONVERSATION_DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getStorageSuffix() {
  const session = getAuthSession();
  return session?.authUsername || session?.username || 'guest';
}

function normalizeTimestamp(value: unknown, fallbackValue: string) {
  if (typeof value !== 'string') {
    return fallbackValue;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? fallbackValue : new Date(timestamp).toISOString();
}

function buildConversationTitleFromMessage(content = '') {
  const normalizedContent = String(content).replace(/\s+/g, ' ').trim();

  if (!normalizedContent) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  if (normalizedContent.length <= 48) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, 45).trimEnd()}...`;
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
        actions: Array.isArray(message.actions)
          ? message.actions.filter(
              (action) => action && typeof action === 'object' && typeof action.url === 'string',
            )
          : [],
        trace: Array.isArray(message.trace) ? message.trace : [],
        animate: false,
      } satisfies ChatMessage;
    })
    .filter((message) => message.content.trim())
    .slice(-MAX_PERSISTED_MESSAGES);

  return messages.length ? messages : [INITIAL_MESSAGE];
}

function createConversation(overrides: Partial<ChatConversation> = {}): ChatConversation {
  const now = new Date().toISOString();
  const messages = overrides.messages
    ? sanitizeStoredMessages(overrides.messages)
    : [INITIAL_MESSAGE];
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content || '';
  const createdAt = normalizeTimestamp(overrides.createdAt, now);
  const updatedAt = normalizeTimestamp(overrides.updatedAt, createdAt);

  return {
    id:
      typeof overrides.id === 'string' && overrides.id.trim()
        ? overrides.id
        : createId('conversation'),
    title:
      typeof overrides.title === 'string' && overrides.title.trim()
        ? overrides.title.trim()
        : buildConversationTitleFromMessage(firstUserMessage),
    createdAt,
    updatedAt,
    messages,
    draft: typeof overrides.draft === 'string' ? overrides.draft : '',
  };
}

function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort(
    (left, right) =>
      Date.parse(right.updatedAt || right.createdAt) -
      Date.parse(left.updatedAt || left.createdAt),
  );
}

function sanitizeStoredConversations(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const knownConversationIds = new Set<string>();
  const conversations: ChatConversation[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const conversation = createConversation(item as Partial<ChatConversation>);

    if (knownConversationIds.has(conversation.id)) {
      continue;
    }

    knownConversationIds.add(conversation.id);
    conversations.push(conversation);

    if (conversations.length >= MAX_CONVERSATIONS) {
      break;
    }
  }

  return sortConversations(conversations);
}

function safeParseStoredValue<T>(rawValue: string | null, fallbackValue: T): T {
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallbackValue;
  }
}

function loadStoredMessages(storageKey: string) {
  if (typeof window === 'undefined') {
    return [INITIAL_MESSAGE];
  }

  return sanitizeStoredMessages(
    safeParseStoredValue(window.localStorage.getItem(storageKey), [INITIAL_MESSAGE]),
  );
}

function loadStoredDraft(storageKey: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(storageKey) || '';
}

function loadConversationState({
  conversationsStorageKey,
  activeConversationStorageKey,
  legacyChatStorageKey,
  legacyDraftStorageKey,
}: {
  conversationsStorageKey: string;
  activeConversationStorageKey: string;
  legacyChatStorageKey: string;
  legacyDraftStorageKey: string;
}): StoredConversationState {
  const fallbackConversation = createConversation();

  if (typeof window === 'undefined') {
    return {
      conversations: [fallbackConversation],
      activeConversationId: fallbackConversation.id,
    };
  }

  const storedConversations = sanitizeStoredConversations(
    safeParseStoredValue(window.localStorage.getItem(conversationsStorageKey), []),
  );

  if (storedConversations.length) {
    const storedActiveConversationId =
      window.localStorage.getItem(activeConversationStorageKey) || storedConversations[0].id;

    return {
      conversations: storedConversations,
      activeConversationId: storedConversations.some(
        (conversation) => conversation.id === storedActiveConversationId,
      )
        ? storedActiveConversationId
        : storedConversations[0].id,
    };
  }

  const legacyMessages = loadStoredMessages(legacyChatStorageKey);
  const legacyDraft = loadStoredDraft(legacyDraftStorageKey);
  const hasLegacyConversation =
    legacyDraft.trim().length > 0 ||
    legacyMessages.some(
      (message) =>
        message.role === 'user' ||
        (message.role === 'assistant' && message.content !== INITIAL_MESSAGE.content),
    );

  if (hasLegacyConversation) {
    const migratedConversation = createConversation({
      messages: legacyMessages,
      draft: legacyDraft,
    });

    return {
      conversations: [migratedConversation],
      activeConversationId: migratedConversation.id,
    };
  }

  return {
    conversations: [fallbackConversation],
    activeConversationId: fallbackConversation.id,
  };
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

function buildConversationPreview(conversation: ChatConversation) {
  const latestMessage = [...conversation.messages]
    .reverse()
    .find(
      (message) =>
        message.content.trim() &&
        (message.role === 'user' || message.content !== INITIAL_MESSAGE.content),
    );

  if (!latestMessage) {
    return 'Sem mensagens ainda';
  }

  const normalizedPreview = latestMessage.content.replace(/\s+/g, ' ').trim();

  if (normalizedPreview.length <= 68) {
    return normalizedPreview;
  }

  return `${normalizedPreview.slice(0, 65).trimEnd()}...`;
}

function formatConversationTimestamp(timestamp: string) {
  const parsedTimestamp = Date.parse(timestamp);

  if (Number.isNaN(parsedTimestamp)) {
    return '';
  }

  return CONVERSATION_DATE_FORMATTER.format(new Date(parsedTimestamp));
}

function ConversationsToggleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="4" width="17" height="16" rx="3.5" />
      <path d="M9 4v16" />
    </svg>
  );
}

export default function LinkAi() {
  const storageSuffix = useMemo(() => getStorageSuffix(), []);
  const legacyChatStorageKey = `${LEGACY_CHAT_STORAGE_PREFIX}:${storageSuffix}`;
  const legacyDraftStorageKey = `${LEGACY_DRAFT_STORAGE_PREFIX}:${storageSuffix}`;
  const conversationsStorageKey = `${CONVERSATIONS_STORAGE_PREFIX}:${storageSuffix}`;
  const activeConversationStorageKey = `${ACTIVE_CONVERSATION_STORAGE_PREFIX}:${storageSuffix}`;
  const initialConversationState = useMemo(
    () =>
      loadConversationState({
        conversationsStorageKey,
        activeConversationStorageKey,
        legacyChatStorageKey,
        legacyDraftStorageKey,
      }),
    [
      activeConversationStorageKey,
      conversationsStorageKey,
      legacyChatStorageKey,
      legacyDraftStorageKey,
    ],
  );
  const [conversationState, setConversationState] = useState<StoredConversationState>(
    initialConversationState,
  );
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [composerHeight, setComposerHeight] = useState(108);
  const [isSending, setIsSending] = useState(false);
  const [thinkingDots, setThinkingDots] = useState('.');
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [visibleThinkingSteps, setVisibleThinkingSteps] = useState<string[]>([]);
  const [isConversationPanelOpen, setIsConversationPanelOpen] = useState(false);
  const [conversationPendingDelete, setConversationPendingDelete] =
    useState<ChatConversation | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  useBodyScrollLock(
    isConversationPanelOpen || Boolean(conversationPendingDelete),
  );

  const conversations = conversationState.conversations;
  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === conversationState.activeConversationId,
    ) || conversations[0];

  function focusComposer() {
    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  }

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
    setConversationState(initialConversationState);
  }, [initialConversationState]);

  useEffect(() => {
    if (!activeConversation) {
      return;
    }

    if (conversationState.activeConversationId === activeConversation.id) {
      return;
    }

    setConversationState((currentValue) => ({
      ...currentValue,
      activeConversationId: activeConversation.id,
    }));
  }, [activeConversation, conversationState.activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [
    activeConversation?.id,
    activeConversation?.messages,
    composerHeight,
    isSending,
    visibleThinkingSteps.length,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const persistedConversations = sortConversations(conversations)
      .slice(0, MAX_CONVERSATIONS)
      .map((conversation) => ({
        ...conversation,
        draft: conversation.draft,
        messages: conversation.messages
          .map((message) => ({
            ...message,
            animate: false,
          }))
          .slice(-MAX_PERSISTED_MESSAGES),
      }));

    window.localStorage.setItem(
      conversationsStorageKey,
      JSON.stringify(persistedConversations),
    );

    if (activeConversation?.id) {
      window.localStorage.setItem(activeConversationStorageKey, activeConversation.id);
    } else {
      window.localStorage.removeItem(activeConversationStorageKey);
    }

    window.localStorage.removeItem(legacyChatStorageKey);
    window.localStorage.removeItem(legacyDraftStorageKey);
  }, [
    activeConversation?.id,
    activeConversationStorageKey,
    conversations,
    conversationsStorageKey,
    legacyChatStorageKey,
    legacyDraftStorageKey,
  ]);

  useEffect(() => {
    if (!isSending) {
      setThinkingDots('.');
      setVisibleThinkingSteps([]);
      return;
    }

    const latestStep = thinkingSteps.length
      ? thinkingSteps[thinkingSteps.length - 1]
      : '';

    setVisibleThinkingSteps(latestStep ? [latestStep] : []);

    const dotsInterval = window.setInterval(() => {
      setThinkingDots((currentValue) =>
        currentValue.length >= 3 ? '.' : `${currentValue}.`,
      );
    }, 350);

    return () => {
      window.clearInterval(dotsInterval);
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

  useEffect(() => {
    if (!isConversationPanelOpen) {
      return;
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      setIsConversationPanelOpen(false);
    }

    window.addEventListener('keydown', handleEscapeKey);

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isConversationPanelOpen]);

  function updateActiveConversationDraft(nextDraft: string) {
    if (!activeConversation) {
      return;
    }

    setConversationState((currentValue) => ({
      ...currentValue,
      conversations: currentValue.conversations.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              draft: nextDraft,
            }
          : conversation,
      ),
    }));
  }

  function handleCreateConversation() {
    if (isSending) {
      return;
    }

    const nextConversation = createConversation();

    setConversationState((currentValue) => ({
      conversations: [nextConversation, ...currentValue.conversations].slice(
        0,
        MAX_CONVERSATIONS,
      ),
      activeConversationId: nextConversation.id,
    }));

    setIsConversationPanelOpen(false);
    focusComposer();
  }

  function handleSelectConversation(conversationId: string) {
    if (isSending || conversationId === activeConversation?.id) {
      return;
    }

    setConversationState((currentValue) => ({
      ...currentValue,
      activeConversationId: conversationId,
    }));

    setIsConversationPanelOpen(false);
    focusComposer();
  }

  function handleDeleteConversation(conversationId: string) {
    if (isSending) {
      return;
    }

    const conversationToDelete = conversations.find(
      (conversation) => conversation.id === conversationId,
    );

    if (!conversationToDelete) {
      return;
    }

    setConversationPendingDelete(conversationToDelete);
  }

  function confirmDeleteConversation() {
    if (!conversationPendingDelete) {
      return;
    }

    const conversationId = conversationPendingDelete.id;
    setConversationPendingDelete(null);

    setConversationState((currentValue) => {
      const remainingConversations = currentValue.conversations.filter(
        (conversation) => conversation.id !== conversationId,
      );

      if (!remainingConversations.length) {
        const replacementConversation = createConversation();

        return {
          conversations: [replacementConversation],
          activeConversationId: replacementConversation.id,
        };
      }

      return {
        conversations: remainingConversations,
        activeConversationId:
          currentValue.activeConversationId === conversationId
            ? remainingConversations[0].id
            : currentValue.activeConversationId,
      };
    });
  }

  async function handleSubmit() {
    const targetConversation = activeConversation;
    const trimmedMessage = targetConversation?.draft.trim() || '';

    if (!targetConversation || !trimmedMessage || isSending) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      content: trimmedMessage,
      action: null,
      actions: [],
      trace: [],
      animate: false,
    };
    const optimisticMessages = [...targetConversation.messages, nextUserMessage].slice(
      -MAX_PERSISTED_MESSAGES,
    );
    const nextUpdatedAt = new Date().toISOString();
    const nextConversationTitle =
      targetConversation.title === DEFAULT_CONVERSATION_TITLE
        ? buildConversationTitleFromMessage(trimmedMessage)
        : targetConversation.title;

    setConversationState((currentValue) => ({
      ...currentValue,
      conversations: sortConversations(
        currentValue.conversations.map((conversation) =>
          conversation.id === targetConversation.id
            ? {
                ...conversation,
                title: nextConversationTitle,
                draft: '',
                updatedAt: nextUpdatedAt,
                messages: optimisticMessages,
              }
            : conversation,
        ),
      ),
    }));
    setThinkingSteps(buildPreviewSteps(trimmedMessage));
    setIsSending(true);

    try {
      const session = getAuthSession();
      let response:
        | {
            reply: string;
            action: ChatAction | null;
            actions?: ChatAction[];
            trace: ChatTraceStep[];
          }
        | null = null;

      await sendChatMessageStream(
        {
          message: trimmedMessage,
          history: mapMessagesToHistory(optimisticMessages),
          sessionContext: {
            authUsername: session?.authUsername,
            authPassword: session?.authPassword,
            operatorName: session?.username,
          },
        },
        {
          onEvent(event) {
            if (event.type === 'trace') {
              setThinkingSteps((currentValue) => {
                const nextSteps = [...currentValue];

                if (!nextSteps.includes(event.step.message)) {
                  nextSteps.push(event.step.message);
                }

                return nextSteps;
              });
              return;
            }

            if (event.type === 'final') {
              response = event.payload;
              return;
            }

            throw new Error(event.message || 'Falha no streaming do Link AI.');
          },
        },
      );

      if (!response) {
        throw new Error('O Link AI nao retornou resposta final.');
      }

      const assistantMessage: ChatMessage = {
        id: createId('assistant'),
        role: 'assistant',
        content: response.reply,
        action: response.action,
        actions: Array.isArray(response.actions) ? response.actions : [],
        trace: response.trace,
        animate: true,
      };

      setConversationState((currentValue) => ({
        ...currentValue,
        conversations: sortConversations(
          currentValue.conversations.map((conversation) =>
            conversation.id === targetConversation.id
              ? {
                  ...conversation,
                  updatedAt: new Date().toISOString(),
                  messages: [...conversation.messages, assistantMessage].slice(
                    -MAX_PERSISTED_MESSAGES,
                  ),
                }
              : conversation,
          ),
        ),
      }));
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: createId('assistant-error'),
        role: 'assistant',
        content: extractErrorMessage(
          error,
          'Nao consegui concluir a solicitacao agora.',
        ),
        action: null,
        actions: [],
        trace: [
          {
            id: createId('trace-error'),
            message: 'Falha ao processar a solicitacao no backend.',
            status: 'error',
          },
        ],
        animate: false,
      };

      setConversationState((currentValue) => ({
        ...currentValue,
        conversations: sortConversations(
          currentValue.conversations.map((conversation) =>
            conversation.id === targetConversation.id
              ? {
                  ...conversation,
                  updatedAt: new Date().toISOString(),
                  messages: [...conversation.messages, errorMessage].slice(
                    -MAX_PERSISTED_MESSAGES,
                  ),
                }
              : conversation,
          ),
        ),
      }));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/20 transition-opacity duration-200 ${
          isConversationPanelOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsConversationPanelOpen(false)}
        aria-hidden={!isConversationPanelOpen}
      />

      <aside
        className={`fixed bottom-5 right-5 top-5 z-40 flex w-[320px] max-w-[calc(100vw-2.5rem)] flex-col rounded-3xl border-2 border-border bg-primary-foreground p-4 shadow-2xl transition-transform duration-200 ${
          isConversationPanelOpen
            ? 'translate-x-0'
            : 'translate-x-[calc(100%+2rem)]'
        }`}
        aria-hidden={!isConversationPanelOpen}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
            <p className="mt-1 text-sm font-normal text-foreground/60">
              {conversations.length} conversa(s) salvas
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsConversationPanelOpen(false)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/55 transition-colors hover:bg-foreground/5 hover:text-foreground"
            aria-label="Fechar conversas"
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          disabled={isSending}
          onClick={handleCreateConversation}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Nova conversa
        </button>

        <div className="scrollbar-minimal mt-4 flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversation?.id;

            return (
              <div
                key={conversation.id}
                className={`rounded-2xl border p-3 transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background/70'
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:cursor-not-allowed"
                  >
                    <span
                      className={`mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <MessageSquareText size={16} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {conversation.title}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-foreground/60">
                        {formatConversationTimestamp(conversation.updatedAt)}
                      </span>
                      <span className="mt-2 block line-clamp-2 text-xs font-normal text-foreground/70">
                        {buildConversationPreview(conversation)}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Excluir conversa ${conversation.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="relative flex h-full w-full flex-col overflow-hidden p-5 text-2xl font-bold text-gray-700">
        <div className="flex items-center justify-between gap-4 pb-4">
          <h1>Link AI</h1>

          <button
            type="button"
            disabled={isSending}
            onClick={() =>
              setIsConversationPanelOpen((currentValue) => !currentValue)
            }
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl  text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Abrir conversas"
            aria-expanded={isConversationPanelOpen}
          >
            <ConversationsToggleIcon />
          </button>
        </div>

        <section
          ref={scrollContainerRef}
          className="scrollbar-minimal flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-2"
          style={{
            paddingBottom: `${composerHeight + 40}px`,
          }}
        >
          {activeConversation?.messages.map((message) => (
            <MessageComponent
              key={message.id}
              role={message.role}
              content={message.content}
              action={message.action}
              actions={message.actions}
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
              thinkingStepIndex={thinkingSteps.length}
              thinkingStepTotal={thinkingSteps.length}
            />
          ) : null}
        </section>

        <MessageInput
          value={activeConversation?.draft || ''}
          disabled={isSending}
          onChange={updateActiveConversationDraft}
          onSubmit={handleSubmit}
          inputRef={messageInputRef}
          onHeightChange={setComposerHeight}
        />
      </main>

      {conversationPendingDelete ? (
        <ConfirmDialog
          title="Excluir conversa?"
          description={`A conversa "${conversationPendingDelete.title}" sera removida do seu historico local.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          tone="danger"
          onClose={() => setConversationPendingDelete(null)}
          onConfirm={confirmDeleteConversation}
        />
      ) : null}
    </>
  );
}
