/**
 * Chat Input Component
 *
 * Input box พร้อม:
 * - Text input with auto-resize
 * - File/Image upload buttons
 * - Send button
 * - Disabled state
 *
 * TODO: Implement file upload to Supabase Storage
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (
    message: string,
    attachments?: { type: 'file' | 'image'; url: string; name: string }[]
  ) => Promise<any>;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<
    { type: 'file' | 'image'; url: string; name: string }[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handleInput = (value: string) => {
    setMessage(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Send message
  const handleSend = async () => {
    if (!message.trim() || disabled) return;

    const result = await onSend(message, attachments);

    if (result.success) {
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Enter to send (Shift+Enter for new line)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // TODO: Implement file upload
  const handleFileUpload = () => {
    alert('File upload coming soon!');
  };

  const handleImageUpload = () => {
    alert('Image upload coming soon!');
  };

  return (
    <div className="bg-white border-t p-4">
      <div className="max-w-4xl mx-auto">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-2 flex gap-2">
            {attachments.map((attachment, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-700"
              >
                {attachment.type === 'image' ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
                <span className="truncate max-w-xs">{attachment.name}</span>
                <button
                  onClick={() =>
                    setAttachments(attachments.filter((_, idx) => idx !== i))
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex items-end gap-2">
          {/* Attach Buttons */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileUpload}
              disabled={disabled}
              type="button"
              title={t('chat.attachFile')}
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleImageUpload}
              disabled={disabled}
              type="button"
              title={t('chat.attachImage')}
            >
              <ImageIcon className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || t('chat.placeholder')}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className="h-12 w-12 rounded-xl"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-400 mt-2 text-center">
          กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่
        </p>
      </div>
    </div>
  );
}
