'use client';

import { useState, type ReactNode } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { useToast } from '@astryxdesign/core/Toast';
import {
  ChatLayout,
  ChatMessageList,
  ChatMessage,
  ChatComposer,
} from '@astryxdesign/core';
import { Trash2, Copy, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface ChatMessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { document: string; page?: number; excerpt: string }[];
}

const styles = `
  @keyframes pulse-dot {
    0%, 80%, 100% { opacity: 0; transform: scale(0.6); }
    40% { opacity: 1; transform: scale(1); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .msg-enter {
    animation: fade-in 0.2s ease-out;
  }
  .msg-group:hover .copy-btn {
    opacity: 1;
  }
  .copy-btn {
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .source-chip {
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }
  .source-chip:hover {
    border-color: var(--color-accent);
    background-color: var(--color-accent-muted);
  }

`;

function renderContent(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const breakIdx = remaining.indexOf('\n');

    const nextBold = boldMatch ? boldMatch.index! : Infinity;
    const nextCode = codeMatch ? codeMatch.index! : Infinity;
    const nextBreak = breakIdx !== -1 ? breakIdx : Infinity;

    if (nextBold === Infinity && nextCode === Infinity && nextBreak === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    const closest = Math.min(nextBold, nextCode, nextBreak);

    if (closest > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, closest)}</span>);
      remaining = remaining.slice(closest);
      continue;
    }

    if (nextBold === 0 && boldMatch) {
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
    } else if (nextCode === 0 && codeMatch) {
      parts.push(
        <code key={key++} style={{
          fontSize: '0.9em', padding: '1px 4px', borderRadius: 4,
          backgroundColor: 'var(--color-overlay-hover)',
        }}>
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
    } else if (nextBreak === 0) {
      parts.push(<br key={key++} />);
      remaining = remaining.slice(1);
    }
  }

  return parts;
}

export default function ChatPage() {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSend = async (value: string) => {
    const text = value.trim();
    if (!text || isLoading) return;
    setInput('');

    const userMsg: ChatMessageType = {
      id: `m${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          conversationId: conversationId ?? undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setConversationId(data.conversation_id);

      const reply: ChatMessageType = {
        id: `m${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        sources: (data.sources ?? []).map((s: { documentId: number; chunkIndex: number }) => ({
          document: `Document ${s.documentId}`,
          excerpt: `Chunk ${s.chunkIndex}`,
        })),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    } catch (error) {
      toast({ body: error instanceof Error ? error.message : 'Failed to get response' });
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setConversationId(null);
    toast({ body: 'Chat cleared' });
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <VStack gap={4} style={{ height: '100%', overflow: 'hidden' }}>
      <style>{styles}</style>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, paddingBottom: 4, borderBottom: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>AI Chat</span>
        <Button label="Clear chat" variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={handleClear} />
      </div>

      {messages.length === 0 && !isLoading ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 16 }}>Start your conversation</Text>
        </div>
      ) : (
      <ChatLayout style={{ flex: 1, minHeight: 0, overflow: 'hidden' }} composer={<div />}>
        <ChatMessageList>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className="msg-group">
                <ChatMessage sender={msg.role}>
                  <div className="msg-enter" style={{
                    display: 'flex', flexDirection: 'column', width: '100%',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}>
                    <HStack gap={2} align="start" style={{ maxWidth: '85%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                      <VStack gap={0} style={{ minWidth: 0 }}>
                        <div style={{
                          ...(isUser ? {
                            backgroundColor: 'var(--color-accent)',
                            color: '#fff',
                            padding: '10px 16px',
                            borderRadius: 16,
                            borderBottomRightRadius: 4,
                          } : {
                            backgroundColor: 'var(--color-background-card)',
                            border: '1px solid var(--color-border)',
                            padding: '10px 16px',
                            borderRadius: 16,
                            borderBottomLeftRadius: 4,
                          }),
                        }}>
                          <div style={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            color: isUser ? '#fff' : 'var(--color-text-primary)',
                          }}>
                            {renderContent(msg.content)}
                          </div>
                        </div>
                        <HStack gap={2} align="center" style={{
                          marginTop: 4,
                          justifyContent: isUser ? 'flex-end' : 'flex-start',
                        }}>
                          <span style={{ fontSize: 11, opacity: 0.4 }}>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              className="copy-btn"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              style={{
                                border: 'none', background: 'none', cursor: 'pointer',
                                padding: 2, display: 'flex', alignItems: 'center',
                                borderRadius: 4, color: 'var(--color-text-secondary)',
                              }}
                              title="Copy"
                            >
                              {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </div>
                </ChatMessage>
              </div>
            );
          })}
          {isLoading && (
            <ChatMessage sender="assistant">
              <div className="msg-enter" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '10px 16px', borderRadius: 16, borderBottomLeftRadius: 4,
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background-card)',
                }}>
                  <HStack gap={2} align="center">
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      {[0, 0.16, 0.32].map((delay) => (
                        <span key={delay} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          backgroundColor: 'var(--color-accent)',
                          display: 'inline-block',
                          animation: 'pulse-dot 1.4s ease-in-out infinite',
                          animationDelay: `${delay}s`,
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      Searching documents...
                    </span>
                  </HStack>
                </div>
              </div>
            </ChatMessage>
          )}
        </ChatMessageList>
      </ChatLayout>
      )}

      <div style={{ border: '1px solid var(--color-border)', borderRadius: 25, overflow: 'hidden' }}>
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          placeholder="Ask a question..."
        />
      </div>
    </VStack>
  );
}