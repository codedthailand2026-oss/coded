/**
 * Graphic Generator Component - Freepik Style
 *
 * UI สำหรับสร้าง Image/Video/Audio แบบ Freepik เป๊ะ:
 * - Model selector (Auto, Flux Pro, etc.)
 * - References (Style, Character, Image uploads)
 * - Templates (Featured preset prompts)
 * - Prompt input (textarea)
 * - Generate button
 * - Credits display
 */

'use client';

import { useState } from 'react';
import { Upload, Sparkles, User, Image as ImageIcon, Wand2, X } from 'lucide-react';
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

type ReferenceTab = 'style' | 'character' | 'upload';

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  file: File;
}

interface Template {
  id: string;
  title: string;
  prompt: string;
  thumbnail: string;
  category: string;
}

// Mock Templates - TODO: Load from database
const FEATURED_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Generate a retro sci-fi scene',
    prompt: 'Realistic, professional photo of retro sci-fi scene with spaceships, vibrant colors, 4K quality, cinematic lighting, sharp details',
    thumbnail: '/templates/scifi.jpg',
    category: 'Featured',
  },
  {
    id: '2',
    title: 'Create dynamic sports photo',
    prompt: 'Action shot of athlete in motion, dynamic lighting, vibrant colors, high speed photography, professional sports photography',
    thumbnail: '/templates/sports.jpg',
    category: 'Featured',
  },
  {
    id: '3',
    title: 'Generate landscape drone view',
    prompt: 'Aerial drone photography of beautiful landscape, golden hour lighting, stunning vista, 4K quality, professional photography',
    thumbnail: '/templates/landscape.jpg',
    category: 'Featured',
  },
  {
    id: '4',
    title: 'Create editorial still life',
    prompt: 'Professional product photography, editorial style, clean background, studio lighting, high detail, commercial quality',
    thumbnail: '/templates/stilllife.jpg',
    category: 'Featured',
  },
];

const STYLES = [
  { id: 'realistic', name: 'Realistic', icon: '📷' },
  { id: 'cartoon', name: 'Cartoon', icon: '🎨' },
  { id: 'anime', name: 'Anime', icon: '✨' },
  { id: 'watercolor', name: 'Watercolor', icon: '🖌️' },
  { id: '3d', name: '3D Render', icon: '🎬' },
  { id: 'sketch', name: 'Sketch', icon: '✏️' },
];

export function GraphicGenerator({ type }: GraphicGeneratorProps) {
  const { t } = useTranslation();

  const [model, setModel] = useState('auto');
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<ReferenceTab>('style');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generating, setGenerating] = useState(false);

  // TODO: Fetch from Supabase
  const graphicCredits = 50;

  const handleTemplateClick = (template: Template) => {
    setPrompt(template.prompt);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url: event.target?.result as string,
          file,
        };
        setUploadedImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-card">
        <div>
          <h1 className="text-xl font-bold">
            {type === 'image' && 'รูปภาพ สร้างการฟิก'}
            {type === 'video' && 'วิดีโอ สร้างการฟิก'}
            {type === 'audio' && 'เสียง สร้างการฟิก'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            สร้างภาพด้วย AI คุณภาพสูง
          </p>
        </div>

        {/* Credits */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">เครดิตการฟิก</div>
          <div className="text-2xl font-bold text-primary">
            {graphicCredits}{' '}
            <span className="text-sm font-normal text-muted-foreground">คงเหลือ</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Left Panel - Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Column */}
            <div className="lg:col-span-1 space-y-4">
              {/* Model Selection */}
              <div className="bg-card rounded-xl border p-4">
                <label className="block text-sm font-semibold mb-3">MODEL</label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        <span>Auto</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="flux-pro">Flux Pro</SelectItem>
                    <SelectItem value="flux-realism">Flux Realism</SelectItem>
                    <SelectItem value="stable-diffusion">Stable Diffusion XL</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  ระบบจะเลือก model ที่เหมาะสมที่สุดอัตโนมัติ
                </p>
              </div>

              {/* References */}
              <div className="bg-card rounded-xl border p-4">
                <label className="block text-sm font-semibold mb-3">REFERENCES</label>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'style'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    สไตล์
                  </button>
                  <button
                    onClick={() => setActiveTab('character')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'character'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    ตัวละคร
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'upload'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    อัปโหลด
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-3">
                  {/* Style Tab */}
                  {activeTab === 'style' && (
                    <div className="grid grid-cols-2 gap-2">
                      {STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() =>
                            setSelectedStyle(selectedStyle === style.id ? null : style.id)
                          }
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            selectedStyle === style.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-2xl mb-1">{style.icon}</div>
                          <div className="text-xs font-medium">{style.name}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Character Tab */}
                  {activeTab === 'character' && (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground mb-3">
                        อัปโหลดรูปตัวละครที่ต้องการใช้
                      </p>
                      <label htmlFor="character-upload">
                        <Button size="sm" asChild>
                          <span className="cursor-pointer">เลือกรูป</span>
                        </Button>
                      </label>
                      <input
                        id="character-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Upload Tab */}
                  {activeTab === 'upload' && (
                    <div>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">อัปโหลดรูปอ้างอิง</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          PNG, JPG สูงสุด 10MB
                        </p>
                        <label htmlFor="image-upload">
                          <Button size="sm" variant="outline" asChild>
                            <span className="cursor-pointer">เลือกรูป</span>
                          </Button>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Uploaded Images */}
                      {uploadedImages.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {uploadedImages.map((img) => (
                            <div key={img.id} className="relative group">
                              <img
                                src={img.url}
                                alt={img.name}
                                className="w-full h-20 object-cover rounded-lg border"
                              />
                              <button
                                onClick={() => removeImage(img.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating || graphicCredits < 1}
                className="w-full h-12 text-base font-semibold"
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
                    สร้าง (1 Credit)
                  </>
                )}
              </Button>
            </div>

            {/* Prompt & Templates Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt */}
              <div className="bg-card rounded-xl border p-4">
                <label className="block text-sm font-semibold mb-3">PROMPT</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Realistic, professional photo of the main object placed naturally on a marble countertop with towels. The object must appear true to scale and remain the main focal point, captured with sharp detail and high clarity. The background should look natural but slightly blurred. Ensure natural lighting, realistic shadows, and a clean, polished advertising style."
                  rows={8}
                  className="resize-none text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    ยิ่งบอกรายละเอียดมาก ยิ่งได้ผลลัพธ์ที่ดี
                  </p>
                  <p className="text-xs text-muted-foreground">{prompt.length}/2000</p>
                </div>
              </div>

              {/* Templates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Featured</h3>
                  <button className="text-sm text-primary hover:underline">
                    ดูทั้งหมด →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {FEATURED_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className="group text-left bg-card rounded-xl border overflow-hidden hover:border-primary transition-all hover:shadow-lg"
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {template.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-4">ผลงานล่าสุด</h3>
                <div className="text-center text-muted-foreground py-12">
                  <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">ยังไม่มีผลงาน</p>
                  <p className="text-xs mt-1">สร้างผลงานแรกของคุณเลย!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
