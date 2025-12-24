/**
 * Chat / Content Marketing Page
 *
 * หน้าสำหรับ chat กับ AI และสร้าง content marketing
 *
 * TODO:
 * - เพิ่ม chat interface (input, message list)
 * - เชื่อมต่อ n8n workflow
 * - บันทึก conversation history
 * - แสดง credits ที่เหลือ
 */

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ChatPage() {
  return (
    <MainLayout>
      <Header
        title="Chat / Content Marketing"
        description="สร้าง content และตอบคำถามด้วย AI"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              ฟีเจอร์ Chat กำลังพัฒนา...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              เร็วๆ นี้คุณจะสามารถใช้ AI สร้าง content marketing และตอบคำถามได้
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
