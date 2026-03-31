import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { Bot, LoaderCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatAction, ChatTraceStep } from '../../services/linkAi.service';

type ChatRole = 'assistant' | 'user';

type Props = {
  role: ChatRole;
  content?: string;
  action?: ChatAction | null;
  trace?: ChatTraceStep[];
  isThinking?: boolean;
  thinkingLabel?: string;
  thinkingSteps?: string[];
  animate?: boolean;
  onContentProgress?: () => void;
};

function getTraceDotColor(status: ChatTraceStep['status']) {
  if (status === 'success') {
    return 'bg-primary';
  }

  if (status === 'error') {
    return 'bg-red-500';
  }

  return 'bg-foreground/35';
}

function renderContentWithLinks(content: string) {
  const markdownLinkPattern = /\[([^\]]+)\]\((\/main\/[^)\s]+|https?:\/\/[^)\s]+)\)/g;
  const lines = content.split('\n');

  return lines.map((line, lineIndex) => {
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    markdownLinkPattern.lastIndex = 0;

    while ((match = markdownLinkPattern.exec(line)) !== null) {
      const [fullMatch, label, href] = match;

      if (match.index > lastIndex) {
        nodes.push(line.slice(lastIndex, match.index));
      }

      nodes.push(
        href.startsWith('/main/') ? (
          <Link
            key={`${href}-${match.index}`}
            to={href}
            className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-opacity hover:opacity-80"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`${href}-${match.index}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-opacity hover:opacity-80"
          >
            {label}
          </a>
        ),
      );

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < line.length) {
      nodes.push(line.slice(lastIndex));
    }

    return (
      <Fragment key={`line-${lineIndex}`}>
        {nodes}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </Fragment>
    );
  });
}

export default function MessageComponent({
  role,
  content = '',
  action = null,
  trace = [],
  isThinking = false,
  thinkingLabel = 'Pensando...',
  thinkingSteps = [],
  animate = false,
  onContentProgress,
}: Props) {
  const isAi = role === 'assistant';
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
            <div className="mt-3 space-y-2">
              {thinkingSteps.map((step) => (
                <div
                  key={step}
                  className="link-ai-step flex items-start gap-3 text-[15px] font-normal text-foreground/75"
                >
                  <span className="mt-1 size-2.5 rounded-full bg-primary" />
                  <span>{step}</span>
                </div>
              ))}
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
              {renderContentWithLinks(displayedContent)}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-base font-normal leading-normal">
              {displayedContent}
              {isAi && isAnimating ? (
                <span className="ml-1 inline-block h-5 w-[2px] animate-pulse rounded-full bg-primary align-middle " />
              ) : null}
            </p>
          )}

          {isAi && !isAnimating && action?.type === 'download' && action.url ? (
            <a
              href={action.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              {action.label || 'Baixar arquivo'}
            </a>
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
