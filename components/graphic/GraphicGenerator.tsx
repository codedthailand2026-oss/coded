/**
 * Graphic Generator Component
 *
 * UI สำหรับสร้าง Image/Video/Audio แบบ Freepik-style:
 * - Model selector (Auto by default)
 * - References (Style, Character, Upload)
 * - Prompt input (textarea)
 * - Generate button
 * - Credits display
 *
 * TODO: Integrate Freepik API
 */

'use client';

import { useState } from 'react';
import { Upload, Sparkles, User, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GraphicGeneratorProps {
  type: 'image' | 'video' | 'audio';
}

type ReferenceType = 'style' | 'character' | 'upload' | null;

export function GraphicGenerator({ type }: GraphicGeneratorProps) {
  const { t } = useTranslation();

  const [model, setModel] = useState('auto');
  const [prompt, setPrompt] = useState('');
  const [selectedReference, setSelectedReference] = useState<ReferenceType>(null);
  const [generating, setGenerating] = useState(false);

  // TODO: Fetch from Supabase
  const graphicCredits = 50;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);

    try {
      // TODO: Call Freepik API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Mock generation complete! (TODO: Integrate Freepik API)');
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const references = [
    { type: 'style' as ReferenceType, icon: Sparkles, label: t('graphic.style') },
    { type: 'character' as ReferenceType, icon: User, label: t('graphic.character') },
    { type: 'upload' as ReferenceType, icon: Upload, label: t('graphic.upload') },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t(`graphic.${type}`)} {t('graphic.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {type === 'image' && 'สร้างภาพด้วย AI คุณภาพสูง'}
            {type === 'video' && 'แปลงรูปเป็นวิดีโอสำหรับ Reels'}
            {type === 'audio' && 'สร้างเสียงพูด Text-to-Speech'}
          </p>
        </div>

        {/* Credits */}
        <div className="text-right">
          <div className="text-sm text-gray-500">{t('credits.graphic')}</div>
          <div className="text-2xl font-bold text-blue-600">
            {graphicCredits}{' '}
            <span className="text-sm text-gray-500">{t('credits.remaining')}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('graphic.model')}
          </label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                {t('graphic.auto')} (Recommended)
              </SelectItem>
              <SelectItem value="flux-pro">Flux Pro (Premium)</SelectItem>
              <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* References */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('graphic.references')} (Optional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {references.map((ref) => {
              const Icon = ref.icon;
              const isSelected = selectedReference === ref.type;

              return (
                <button
                  key={ref.type}
                  onClick={() =>
                    setSelectedReference(isSelected ? null : ref.type)
                  }
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 mx-auto mb-2 ${
                      isSelected ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <div
                    className={`text-sm font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-700'
                    }`}
                  >
                    {ref.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Reference Upload Area */}
          {selectedReference && (
            <div className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                อัปโหลด {selectedReference === 'style' && 'รูปตัวอย่างสไตล์'}
                {selectedReference === 'character' && 'รูปตัวละคร'}
                {selectedReference === 'upload' && 'รูปอ้างอิง'}
              </p>
              <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
              <Button size="sm" className="mt-2">
                เลือกไฟล์
              </Button>
            </div>
          )}
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('graphic.prompt', { type: t(`graphic.${type}`) })}
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              type === 'image'
                ? 'เช่น: A beautiful sunset over the ocean, vibrant colors, 4K quality'
                : type === 'video'
                ? 'เช่น: Camera slowly zooming in, cinematic lighting'
                : 'เช่น: สวัสดีครับ ยินดีต้อนรับสู่...'
            }
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              ยิ่งบอกรายละเอียดมาก ยิ่งได้ผลลัพธ์ที่ดี
            </p>
            <p className="text-xs text-gray-400">{prompt.length}/500</p>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating || graphicCredits < 1}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              กำลังสร้าง...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              {t('graphic.generate')} ({type === 'video' ? '2' : '1'} Credits)
            </>
          )}
        </Button>

        {/* Upgrade Notice */}
        {graphicCredits < 1 && (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              คุณใช้ credits หมดแล้ว 🎨
            </p>
            <Button size="sm" className="mt-2">
              อัปเกรดแผน
            </Button>
          </div>
        )}
      </div>

      {/* Premium Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              อัปเกรดเป็น Premium
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('graphic.upgrade')}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="px-2 py-1 bg-white rounded">✓ 4K Quality</span>
              <span className="px-2 py-1 bg-white rounded">
                ✓ Faster Generation
              </span>
              <span className="px-2 py-1 bg-white rounded">
                ✓ Advanced Models
              </span>
              <span className="px-2 py-1 bg-white rounded">
                ✓ Commercial License
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Generations - TODO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">ผลงานล่าสุด</h3>
        <div className="text-center text-gray-400 py-8">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">ยังไม่มีผลงาน</p>
          <p className="text-xs mt-1">สร้างผลงานแรกของคุณเลย!</p>
        </div>
      </div>
    </div>
  );
}
