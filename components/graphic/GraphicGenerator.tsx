/**
 * Graphic Generator Component - Freepik Exact Layout
 *
 * Layout เหมือน Freepik 100%:
 * - Tabs Image/Video/Audio ด้านบน
 * - Left sidebar: MODEL, REFERENCES, PROMPT
 * - Right area: Templates (grid ใหญ่)
 * - Professional icons (no emoji)
 */

'use client';

import { useState } from 'react';
import { Upload, Sparkles, User, Image as ImageIcon, Wand2, X, Camera, Palette, Pen, Box, Film, Mic2 } from 'lucide-react';
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
const TEMPLATE_CATEGORIES = [
  {
    name: 'Featured',
    templates: [
      { id: '1', title: 'Generate a retro sci-fi scene', prompt: 'Realistic, professional photo of retro sci-fi scene with spaceships, vibrant colors, 4K quality', thumbnail: '', category: 'Featured' },
      { id: '2', title: 'Turn product image into a catalog photo', prompt: 'Product photography, clean background, professional catalog style', thumbnail: '', category: 'Featured' },
      { id: '3', title: 'Create dynamic sports photo', prompt: 'Action shot of athlete in motion, dynamic lighting, sports photography', thumbnail: '', category: 'Featured' },
      { id: '4', title: 'Generate landscape drone view', prompt: 'Aerial drone photography, golden hour lighting, stunning vista', thumbnail: '', category: 'Featured' },
      { id: '5', title: 'Create editorial still life', prompt: 'Professional product photography, editorial style, studio lighting', thumbnail: '', category: 'Featured' },
      { id: '6', title: 'Create cinematic frame', prompt: 'Cinematic photography, movie scene, dramatic lighting', thumbnail: '', category: 'Featured' },
    ],
  },
  {
    name: 'Christmas',
    templates: [
      { id: 'c1', title: 'Generate a selfie with Santa', prompt: 'Christmas selfie with Santa Claus, festive background', thumbnail: '', category: 'Christmas' },
      { id: 'c2', title: 'Create a holiday family photo', prompt: 'Family Christmas portrait, festive decorations, warm lighting', thumbnail: '', category: 'Christmas' },
      { id: 'c3', title: 'Create Christmas photobooth', prompt: 'Christmas photobooth style, festive props, holiday theme', thumbnail: '', category: 'Christmas' },
      { id: 'c4', title: 'Christmas portrait', prompt: 'Christmas portrait photography, holiday atmosphere', thumbnail: '', category: 'Christmas' },
    ],
  },
  {
    name: 'Flux 2',
    templates: [
      { id: 'f1', title: 'Generate floating-style product', prompt: 'Floating product photography, minimal background, professional', thumbnail: '', category: 'Flux 2' },
      { id: 'f2', title: 'Place product in realistic setting', prompt: 'Product in realistic environment, natural placement', thumbnail: '', category: 'Flux 2' },
      { id: 'f3', title: 'Generate landscape drone view', prompt: 'Drone photography, aerial view, landscape', thumbnail: '', category: 'Flux 2' },
      { id: 'f4', title: 'Redesign outfit for new season', prompt: 'Fashion photography, outfit design, seasonal style', thumbnail: '', category: 'Flux 2' },
    ],
  },
];

const STYLES = [
  { id: 'realistic', name: 'Realistic', icon: Camera },
  { id: 'artistic', name: 'Artistic', icon: Palette },
  { id: 'sketch', name: 'Sketch', icon: Pen },
  { id: '3d', name: '3D Render', icon: Box },
  { id: 'cinematic', name: 'Cinematic', icon: Film },
  { id: 'minimal', name: 'Minimal', icon: Sparkles },
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
      alert('Mock generation complete!');
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {type === 'image' && 'รูปภาพ สร้างการฟิก'}
            {type === 'video' && 'วีดีโอ สร้างการฟิก'}
            {type === 'audio' && 'เสียง สร้างการฟิก'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {type === 'image' && 'สร้างภาพด้วย AI คุณภาพสูง'}
            {type === 'video' && 'แปลงรูปเป็นวิดีโอสำหรับ Reels'}
            {type === 'audio' && 'สร้างเสียงพูด Text-to-Speech'}
          </p>
        </div>

        {/* Credits */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">เครดิตการฟิก</div>
          <div className="text-xl font-bold text-primary">
            {graphicCredits}{' '}
            <span className="text-xs font-normal text-muted-foreground">คงเหลือ</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r overflow-y-auto p-4 space-y-4 bg-card">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              MODEL
            </label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5" />
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                REFERENCES
              </label>
              <button className="text-xs text-primary hover:underline">+ Add</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-medium transition-colors ${
                  activeTab === 'style'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Style
              </button>
              <button
                onClick={() => setActiveTab('character')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-medium transition-colors ${
                  activeTab === 'character'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Character
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded text-xs font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {/* Style Tab */}
              {activeTab === 'style' && (
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((style) => {
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.id}
                        onClick={() =>
                          setSelectedStyle(selectedStyle === style.id ? null : style.id)
                        }
                        className={`p-3 rounded-lg border transition-all ${
                          selectedStyle === style.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mx-auto mb-1.5 ${selectedStyle === style.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="text-xs font-medium">{style.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Character Tab */}
              {activeTab === 'character' && (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                  <User className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-xs text-muted-foreground mb-3">
                    อัปโหลดรูปตัวละครที่ต้องการใช้
                  </p>
                  <label htmlFor="character-upload">
                    <Button size="sm" variant="outline" asChild>
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
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium mb-1">อัปโหลดรูปอ้างอิง</p>
                    <p className="text-xs text-muted-foreground mb-2">PNG, JPG max 10MB</p>
                    <label htmlFor="image-upload">
                      <Button size="sm" variant="outline" asChild>
                        <span className="cursor-pointer text-xs">เลือกรูป</span>
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
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {uploadedImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-16 object-cover rounded border"
                          />
                          <button
                            onClick={() => removeImage(img.id)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              PROMPT
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Realistic, professional photo of the main object placed naturally on a marble countertop with towels. The object must appear true to scale and remain the main focal point, captured with sharp detail and high clarity. The background should look natural but slightly blurred. Ensure natural lighting, realistic shadows, and a clean, polished advertising style."
              rows={6}
              className="resize-none text-xs"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-muted-foreground">
                ยิ่งบอกรายละเอียดมาก ยิ่งได้ผลลัพธ์ที่ดี
              </p>
              <p className="text-xs text-muted-foreground">{prompt.length}/2000</p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating || graphicCredits < 1}
            className="w-full h-11 font-semibold"
            size="lg"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังสร้าง...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Right Content - Templates */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-8">
            {TEMPLATE_CATEGORIES.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{category.name}</h3>
                  <button className="text-sm text-primary hover:underline">
                    See all →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {category.templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className="group text-left bg-card rounded-lg border overflow-hidden hover:border-primary transition-all hover:shadow-md"
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
