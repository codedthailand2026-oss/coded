/**
 * System Prompt Selector Component
 *
 * Dropdown สำหรับเลือก System Prompt Type:
 * - General: AI ทั่วไป
 * - Marketing: เชี่ยวชาญด้านการตลาด
 * - Analysis: เชี่ยวชาญด้านวิเคราะห์ข้อมูล
 */

'use client';

import { MessageSquare, Sparkles, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SystemPromptType } from '@/types/chat';

interface SystemPromptSelectorProps {
  value: SystemPromptType;
  onChange: (value: SystemPromptType) => void;
}

const PROMPT_OPTIONS = [
  {
    value: 'general' as SystemPromptType,
    icon: MessageSquare,
    color: 'text-gray-600',
  },
  {
    value: 'marketing' as SystemPromptType,
    icon: Sparkles,
    color: 'text-purple-600',
  },
  {
    value: 'analysis' as SystemPromptType,
    icon: BarChart3,
    color: 'text-blue-600',
  },
];

export function SystemPromptSelector({
  value,
  onChange,
}: SystemPromptSelectorProps) {
  const { t } = useTranslation();

  const selectedOption = PROMPT_OPTIONS.find((opt) => opt.value === value);
  const SelectedIcon = selectedOption?.icon || MessageSquare;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <div className="flex items-center gap-2">
          <SelectedIcon className={`h-4 w-4 ${selectedOption?.color}`} />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {PROMPT_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${option.color}`} />
                <span>{t(`chat.systemPrompt.${option.value}`)}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
