/**
 * Chat Types
 *
 * Types สำหรับ AI Chat feature
 */

export type SystemPromptType = 'general' | 'marketing' | 'analysis';

export type MessageRole = 'user' | 'assistant';

export interface Attachment {
  type: 'file' | 'image';
  url: string;
  name: string;
  size: number;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  system_prompt_type: SystemPromptType;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id?: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  created_at: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  system_prompt_type: SystemPromptType;
}

export interface CreateMessageData {
  conversation_id: string;
  content: string;
  attachments?: Attachment[];
}
