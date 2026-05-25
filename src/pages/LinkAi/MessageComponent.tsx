import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { Bot, LoaderCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatAction, ChatTraceStep } from '../../services/linkAi.service';

type ChatRole = 'assistant' | 'user';

type Props = {
  role: ChatRole;
  content?: string;
  action?: ChatAction | null;
  actions?: ChatAction[];
  trace?: ChatTraceStep[];
  isThinking?: boolean;
  thinkingLabel?: string;
  thinkingSteps?: string[];
  thinkingStepIndex?: number;
  thinkingStepTotal?: number;
  animate?: boolean;
  onContentProgress?: () => void;
};

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; label: string; href: string };

function getTraceDotColor(status: ChatTraceStep['status']) {
  if (status === 'success') {
    return 'bg-primary';
  }

  if (status === 'error') {
    return 'bg-red-500';
  }

  return 'bg-foreground/35';
}

function tokenizeInlineMarkdown(content: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern =
    /(\[([^\]]+)\]\((\/main\/[^)\s]+|https?:\/\/[^)\s]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }

    if (match[2] && match[3]) {
      tokens.push({
        type: 'link',
        label: match[2],
        href: match[3],
      });
    } else if (match[5]) {
      tokens.push({
        type: 'code',
        value: match[5],
      });
    } else if (match[7]) {
      tokens.push({
        type: 'strong',
        value: match[7],
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    tokens.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  return tokens;
}

function renderInlineMarkdown(content: string, keyPrefix: string) {
  return tokenizeInlineMarkdown(content).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.type === 'strong') {
      return <strong key={key}>{token.value}</strong>;
    }

    if (token.type === 'code') {
      return (
        <code
          key={key}
          className="rounded bg-foreground/6 px-1.5 py-0.5 font-mono text-[0.95em]"
        >
          {token.value}
        </code>
      );
    }

    if (token.type === 'link') {
      return token.href.startsWith('/main/') ? (
        <Link
          key={key}
          to={token.href}
          className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-opacity hover:opacity-80"
        >
          {token.label}
        </Link>
      ) : (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-opacity hover:opacity-80"
        >
          {token.label}
        </a>
      );
    }

    return <Fragment key={key}>{token.value}</Fragment>;
  });
}

function renderMarkdown(content: string) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 6);
      const headingText = headingMatch[2];
      const headingClassByLevel: Record<number, string> = {
        1: 'text-2xl font-semibold',
        2: 'text-xl font-semibold',
        3: 'text-lg font-semibold',
        4: 'text-base font-semibold',
        5: 'text-sm font-semibold',
        6: 'text-sm font-semibold uppercase tracking-wide',
      };

      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      nodes.push(
        <Tag
          key={`heading-${index}`}
          className={`${headingClassByLevel[level]} mt-4 first:mt-0`}
        >
          {renderInlineMarkdown(headingText, `heading-${index}`)}
        </Tag>,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      const items: string[] = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }

      nodes.push(
        <ul key={`ul-${index}`} className="mt-3 list-disc space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`ul-item-${index}-${itemIndex}`} className="leading-relaxed">
              {renderInlineMarkdown(item, `ul-${index}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      const items: string[] = [];

      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }

      nodes.push(
        <ol key={`ol-${index}`} className="mt-3 list-decimal space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`ol-item-${index}-${itemIndex}`} className="leading-relaxed">
              {renderInlineMarkdown(item, `ol-${index}-${itemIndex}`)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines = [trimmedLine];
    index += 1;

    while (index < lines.length) {
      const nextTrimmedLine = lines[index].trim();

      if (
        !nextTrimmedLine ||
        /^(#{1,6})\s+/.test(nextTrimmedLine) ||
        /^[-*]\s+/.test(nextTrimmedLine) ||
        /^\d+\.\s+/.test(nextTrimmedLine)
      ) {
        break;
      }

      paragraphLines.push(nextTrimmedLine);
      index += 1;
    }

    nodes.push(
      <p key={`p-${index}`} className="mt-3 whitespace-pre-wrap leading-relaxed first:mt-0">
        {renderInlineMarkdown(paragraphLines.join(' '), `p-${index}`)}
      </p>,
    );
  }

  return nodes;
}

export default function MessageComponent({
  role,
  content = '',
  action = null,
  actions = [],
  trace = [],
  isThinking = false,
  thinkingLabel = 'Pensando...',
  thinkingSteps = [],
  thinkingStepIndex = 0,
  thinkingStepTotal = 0,
  animate = false,
  onContentProgress,
}: Props) {
  const isAi = role === 'assistant';
  const availableActions =
    actions.length > 0
      ? actions
      : action?.type === 'download' && action.url
        ? [action]
        : [];
  const [displayedContent, setDisplayedContent] = useState(content);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (isThinking) {
      return;
    }

    if (!isAi || !animate || !content.trim()) {
      setDisplayedContent(content);
      setIsAnimating(false);
      return;
    }

    if (hasAnimatedRef.current) {
      setDisplayedContent(content);
      setIsAnimating(false);
      return;
    }

    hasAnimatedRef.current = true;
    const tokens = content.split(/(\s+)/).filter(Boolean);

    setDisplayedContent('');
    setIsAnimating(true);

    let currentIndex = 0;

    const intervalId = window.setInterval(() => {
      currentIndex += 1;
      const nextValue = tokens.slice(0, currentIndex).join('');
      setDisplayedContent(nextValue);
      onContentProgress?.();

      if (currentIndex >= tokens.length) {
        window.clearInterval(intervalId);
        setDisplayedContent(content);
        setIsAnimating(false);
      }
    }, 28);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [animate, content, isAi, isThinking, onContentProgress]);

  useEffect(() => {
    if (!animate || isThinking) {
      setDisplayedContent(content);
    }
  }, [animate, content, isThinking]);

  if (isThinking) {
    return (
      <div className="flex w-full items-start gap-4 self-start">
        <span className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary-foreground p-2 text-primary shadow">
          <Bot size={20} />
        </span>

        <div className="pt-1">
          <div className="flex items-center gap-3">
            <LoaderCircle className="animate-spin text-primary" size={18} />
            <p className="text-[18px] font-medium text-foreground">
              {thinkingLabel}
            </p>
          </div>

          {!!thinkingSteps.length && (
            <div className="mt-3 flex items-center gap-3 text-[15px] font-normal text-foreground/75">
              <span className="rounded-full border border-foreground/15 bg-foreground/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
                {`${Math.max(thinkingStepIndex, 1)} de ${Math.max(
                  thinkingStepTotal,
                  1,
                )}`}
              </span>
              <span>{thinkingSteps[0]}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full items-start gap-4 ${
        isAi ? 'self-start' : 'flex-row-reverse self-end'
      }`}
    >
      <span className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-primary-foreground p-2 text-primary shadow">
        {isAi ? <Bot size={20} /> : <User size={20} />}
      </span>

      <div
        className={`min-w-0 w-fit max-w-[550px] rounded-xl border-2 p-4 shadow ${
          isAi
            ? 'rounded-tl-none border-border bg-primary-foreground text-foreground'
            : 'rounded-tr-none border-primary bg-primary text-primary-foreground'
        } ${isAi ? 'link-ai-message-in' : ''}`}
      >
        <div>
          {isAi && !isAnimating ? (
            <div className="break-words text-base font-normal leading-normal">
              {renderMarkdown(displayedContent)}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-base font-normal leading-normal">
              {displayedContent}
              {isAi && isAnimating ? (
                <span className="ml-1 inline-block h-5 w-[2px] animate-pulse rounded-full bg-primary align-middle " />
              ) : null}
            </p>
          )}

          {isAi && !isAnimating && availableActions.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {availableActions.map((downloadAction, index) => (
                <a
                  key={`${downloadAction.url}-${index}`}
                  href={downloadAction.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  {downloadAction.label || `Baixar arquivo ${index + 1}`}
                </a>
              ))}
            </div>
          ) : null}

          {isAi && !isAnimating && !!trace.length ? (
            <details className="mt-4 w-full max-w-[320px] rounded-xl border border-border bg-background/90">
              <summary className="cursor-pointer list-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">
                Ver etapas executadas
              </summary>

              <div className="border-t border-border px-4 py-3">
                <div className="space-y-2">
                  {trace.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 text-xs font-normal text-foreground/80"
                    >
                      <span
                        className={`mt-1 size-2.5 rounded-full ${getTraceDotColor(step.status)}`}
                      />
                      <span>{step.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  );
}
