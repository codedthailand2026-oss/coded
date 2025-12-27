/**
 * Chat Feature Component
 *
 * AI Chat interface แบบ Freepik style
 * - Full height content area
 * - Projects sidebar (ถ้ามี)
 * - Chat messages + input
 */

'use client';

import { useState, useEffect } from 'react';
import { ProjectSidebar } from '@/components/chat/ProjectSidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SystemPromptSelector } from '@/components/chat/SystemPromptSelector';
import { useTranslation } from '@/lib/i18n/context';
import type { Project, Conversation, Message, SystemPromptType, Attachment } from '@/types/chat';

export function ChatFeature() {
  const { t } = useTranslation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();

      if (data.success) {
        setProjects(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedProject(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  async function createProject(name: string, systemPromptType: SystemPromptType) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, system_prompt_type: systemPromptType }),
    });

    const data = await res.json();

    if (data.success && data.data) {
      setProjects([data.data, ...projects]);
      setSelectedProject(data.data);
    }

    return data;
  }

  async function sendMessage(message: string, attachments?: Attachment[]) {
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          project_id: selectedProject?.id,
          attachments: attachments || [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        const userMsg: Message = {
          id: 'temp-user-' + Date.now(),
          conversation_id: data.data.conversation_id,
          role: 'user',
          content: message,
          attachments: attachments || [],
          created_at: new Date().toISOString(),
        };

        const aiMsg: Message = {
          id: 'temp-ai-' + Date.now(),
          conversation_id: data.data.conversation_id,
          role: 'assistant',
          content: data.data.message,
          created_at: new Date().toISOString(),
        };

        setMessages([...messages, userMsg, aiMsg]);
      }

      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: { message: 'Failed to send message' } };
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full">
      {/* Projects Sidebar */}
      <ProjectSidebar
        projects={projects}
        selectedProject={selectedProject}
        onProjectSelect={setSelectedProject}
        onCreateProject={createProject}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="h-16 border-b px-6 flex items-center justify-between">
          <div>
            <h1 className="font-semibold">{selectedProject?.name || t('chat.title')}</h1>
            {selectedProject && (
              <p className="text-xs text-muted-foreground">
                {t(`chat.systemPrompt.${selectedProject.system_prompt_type}`)}
              </p>
            )}
          </div>

          {selectedProject && (
            <SystemPromptSelector
              value={selectedProject.system_prompt_type}
              onChange={(type) =>
                setSelectedProject({ ...selectedProject, system_prompt_type: type })
              }
            />
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} loading={sending} />
        </div>

        {/* Input */}
        {selectedProject && (
          <ChatInput
            onSend={sendMessage}
            disabled={sending}
            placeholder={t('chat.placeholder')}
          />
        )}
      </div>
    </div>
  );
}
