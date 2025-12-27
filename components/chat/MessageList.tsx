/**
 * Message List Component
 *
 * แสดงรายการข้อความใน conversation:
 * - User messages (ขวา)
 * - Assistant messages (ซ้าย)
 * - Attachments preview
 * - Auto scroll to bottom
 * - Loading indicator
 */

'use client';

import { useEffect, useRef } from 'react';
import { User, Bot, Paperclip, Image as ImageIcon } from 'lucide-react';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom เมื่อมี message ใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Bot className="h-16 w-16 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium mb-1">เริ่มการสนทนาใหม่</p>
            <p className="text-sm">พิมพ์ข้อความด้านล่างเพื่อเริ่มแชท</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const Icon = isUser ? User : Bot;

            return (
              <div
                key={message.id || index}
                className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isUser ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-2xl ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div
                      className={`mb-2 flex gap-2 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.attachments.map((attachment, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-700"
                        >
                          {attachment.type === 'image' ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <Paperclip className="h-4 w-4" />
                          )}
                          <span className="truncate max-w-xs">
                            {attachment.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Text */}
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-xs text-gray-400 mt-1 ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 max-w-2xl">
                <div className="inline-block px-4 py-3 rounded-2xl bg-white border border-gray-200">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
