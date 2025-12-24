/**
 * Image to Video Page
 *
 * หน้าสำหรับแปลงรูปภาพเป็นวิดีโอ
 *
 * TODO:
 * - เพิ่ม image upload interface
 * - เชื่อมต่อ Freepik/Runway API
 * - แสดง preview video
 * - ดาวน์โหลด video
 */

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function ImageToVideoPage() {
  return (
    <MainLayout>
      <Header
        title="Image to Video"
        description="แปลงรูปภาพเป็นวิดีโอสำหรับ Social Media"
        actions={
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              ฟีเจอร์ Image to Video กำลังพัฒนา...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              เร็วๆ นี้คุณจะสามารถแปลงรูปภาพเป็นวิดีโอสำหรับ Reels ได้
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
