/**
 * AI Chat Page
 *
 * Main chat interface พร้อม:
 * - Project sidebar (ซ้าย)
 * - Chat messages (กลาง)
 * - System prompt selector
 * - File/Image upload
 *
 * Flow:
 * 1. Load projects จาก API
 * 2. Select project → Load conversations
 * 3. Send message → Call /api/chat
 * 4. Update credits display
 */

'use client';

import { useState, useEffect } from 'react';
import { ProjectSidebar } from '@/components/chat/ProjectSidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SystemPromptSelector } from '@/components/chat/SystemPromptSelector';
import { useTranslation } from '@/lib/i18n/context';
import type { Project, Conversation, Message, SystemPromptType, Attachment } from '@/types/chat';

export default function ChatPage() {
  const { t } = useTranslation();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load conversations when project selected
  useEffect(() => {
    if (selectedProject) {
      loadConversations(selectedProject.id);
    }
  }, [selectedProject]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // === API CALLS ===

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();

      if (data.success) {
        setProjects(data.data || []);
        // Auto-select first project
        if (data.data && data.data.length > 0) {
          setSelectedProject(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadConversations(projectId: string) {
    try {
      const res = await fetch(`/api/conversations?project_id=${projectId}`);
      const data = await res.json();

      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  async function createProject(name: string, systemPromptType: SystemPromptType) {
    try {
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
    } catch (error) {
      console.error('Failed to create project:', error);
      return { success: false, error: { message: 'Failed to create project' } };
    }
  }

  async function sendMessage(
    message: string,
    attachments?: Attachment[]
  ) {
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          project_id: selectedProject?.id,
          conversation_id: selectedConversation?.id,
          attachments: attachments || [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Add user message + AI response to message list
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

        // Update conversation_id if new
        if (!selectedConversation) {
          setSelectedConversation({
            id: data.data.conversation_id,
            user_id: '',
            project_id: selectedProject?.id,
            title: message.substring(0, 50),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: { message: 'Failed to send message' } };
    } finally {
      setSending(false);
    }
  }

  // === HANDLERS ===

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  // === RENDER ===

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Projects */}
      <ProjectSidebar
        projects={projects}
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
        onCreateProject={createProject}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {selectedProject?.name || t('chat.title')}
            </h1>
            {selectedProject && (
              <p className="text-sm text-gray-500 mt-1">
                {t(`chat.systemPrompt.${selectedProject.system_prompt_type}`)}
              </p>
            )}
          </div>

          {/* System Prompt Selector - เฉพาะตอน new conversation */}
          {selectedProject && !selectedConversation && (
            <SystemPromptSelector
              value={selectedProject.system_prompt_type}
              onChange={(type) => {
                // Update project's default system prompt
                setSelectedProject({ ...selectedProject, system_prompt_type: type });
              }}
            />
          )}

          {/* New Conversation Button */}
          {selectedConversation && (
            <button
              onClick={handleNewConversation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + {t('chat.newProject')}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          {selectedProject ? (
            <MessageList messages={messages} loading={sending} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p className="text-lg mb-2">{t('chat.title')}</p>
                <p className="text-sm">เลือกหรือสร้างโปรเจกต์เพื่อเริ่มแชท</p>
              </div>
            </div>
          )}
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
