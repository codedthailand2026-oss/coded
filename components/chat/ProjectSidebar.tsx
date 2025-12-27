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
import { Plus, MessageSquare, Sparkles, BarChart3, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

// Helper: คำนวณ relative time
function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;

  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

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
    <div className="w-80 bg-card border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background/50">
        <h2 className="text-lg font-bold mb-3">
          {t('chat.projects')}
        </h2>

        {/* New Project Button */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full shadow-sm hover:shadow" size="sm">
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
      <div className="flex-1 overflow-y-auto p-3">
        {projects.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm mt-8 px-4">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium mb-1">ยังไม่มีโปรเจกต์</p>
            <p className="text-xs">สร้างโปรเจกต์เพื่อเริ่มแชท</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => {
              const Icon = PROMPT_ICONS[project.system_prompt_type];
              const isSelected = selectedProject?.id === project.id;

              return (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                    isSelected
                      ? 'bg-primary/10 border-2 border-primary shadow-sm'
                      : 'hover:bg-accent border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback
                        className={`font-semibold text-sm ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
                        }`}
                      >
                        {project.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* Project Name */}
                      <div
                        className={`font-semibold text-sm mb-1 truncate ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {project.name}
                      </div>

                      {/* System Prompt Badge */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge
                          variant={isSelected ? 'default' : 'secondary'}
                          className="text-xs font-medium"
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {t(`chat.systemPrompt.${project.system_prompt_type}`)}
                        </Badge>
                      </div>

                      {/* Last Updated */}
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isSelected ? 'text-primary/70' : 'text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{getRelativeTime(project.updated_at)}</span>
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
