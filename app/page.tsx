/**
 * Home Page
 *
 * หน้าแรกของ application แสดง Dashboard/Overview
 *
 * TODO:
 * - เพิ่มข้อมูล analytics (total usage, credits used, etc.)
 * - แสดง recent activities
 * - Quick actions (New Chat, Upload Image)
 */

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Video, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout>
      <Header
        title="Dashboard"
        description="ยินดีต้อนรับสู่ AI Tools Platform"
        actions={
          <Button>
            เริ่มใช้งาน
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">สวัสดี! 👋</h2>
          <p className="text-muted-foreground">
            เริ่มต้นใช้งาน AI Tools ที่ออกแบบมาเพื่อคนทำงานไทย
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Link href="/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Chat / Content</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  สร้าง content marketing, ตอบคำถาม ด้วย AI ที่เข้าใจบริบทไทย
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/image-to-video">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Image to Video</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  แปลงรูปภาพเป็นวิดีโอสำหรับ Reels และ Social Media
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  ดูสถิติการใช้งาน และ performance ของคุณ
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Chats</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Videos Created</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Chat Credits</CardDescription>
              <CardTitle className="text-3xl">50</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Image Credits</CardDescription>
              <CardTitle className="text-3xl">3</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Getting Started Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>เริ่มต้นใช้งาน</CardTitle>
            <CardDescription>
              ขั้นตอนง่ายๆ เพื่อเริ่มใช้งาน AI Tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">เลือก Tool ที่ต้องการใช้</p>
                  <p className="text-sm text-muted-foreground">
                    Chat, Image to Video, หรือ Analytics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">เริ่มสร้างงาน</p>
                  <p className="text-sm text-muted-foreground">
                    ใส่ input และให้ AI ช่วยสร้างสรรค์ผลงาน
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">ดาวน์โหลดและนำไปใช้</p>
                  <p className="text-sm text-muted-foreground">
                    นำผลลัพธ์ไปใช้งานได้ทันที
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
