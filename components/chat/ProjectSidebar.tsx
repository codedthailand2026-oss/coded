/**
 * Project Sidebar Component
 *
 * แสดงรายการ projects ด้านซ้าย พร้อม:
 * - ปุ่มสร้าง project ใหม่
 * - Select project
 * - แสดง system prompt type
 */

'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Sparkles, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Project, SystemPromptType } from '@/types/chat';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onCreateProject: (name: string, systemPromptType: SystemPromptType) => Promise<any>;
}

// Icons สำหรับแต่ละ system prompt type
const PROMPT_ICONS = {
  general: MessageSquare,
  marketing: Sparkles,
  analysis: BarChart3,
};

export function ProjectSidebar({
  projects,
  selectedProject,
  onProjectSelect,
  onCreateProject,
}: ProjectSidebarProps) {
  const { t } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedType, setSelectedType] = useState<SystemPromptType>('general');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    const result = await onCreateProject(newProjectName, selectedType);

    if (result.success) {
      setIsCreateOpen(false);
      setNewProjectName('');
      setSelectedType('general');
    }
    setCreating(false);
  };

  return (
    <div className="w-80 bg-white border-r flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {t('chat.projects')}
        </h2>

        {/* New Project Button */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('chat.newProject')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('chat.newProject')}</DialogTitle>
              <DialogDescription>
                สร้างโปรเจกต์ใหม่และเลือก System Prompt
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Project Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  ชื่อโปรเจกต์
                </label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="เช่น: Content Marketing Q1"
                  className="w-full"
                />
              </div>

              {/* System Prompt Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  ประเภท AI
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['general', 'marketing', 'analysis'] as SystemPromptType[]).map(
                    (type) => {
                      const Icon = PROMPT_ICONS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            selectedType === type
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 mx-auto mb-1 ${
                              selectedType === type
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                          />
                          <div
                            className={`text-xs font-medium ${
                              selectedType === type
                                ? 'text-blue-900'
                                : 'text-gray-600'
                            }`}
                          >
                            {t(`chat.systemPrompt.${type}`)}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreate}
                disabled={!newProjectName.trim() || creating}
                className="w-full"
              >
                {creating ? t('common.loading') : t('common.create')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2">
        {projects.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>ยังไม่มีโปรเจกต์</p>
            <p className="text-xs mt-1">สร้างโปรเจกต์เพื่อเริ่มแชท</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => {
              const Icon = PROMPT_ICONS[project.system_prompt_type];
              const isSelected = selectedProject?.id === project.id;

              return (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm mb-1 truncate ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {project.name}
                      </div>
                      <div
                        className={`text-xs ${
                          isSelected ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {t(`chat.systemPrompt.${project.system_prompt_type}`)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
