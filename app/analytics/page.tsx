/**
 * Analytics Page
 *
 * หน้าสำหรับดูสถิติการใช้งาน
 *
 * TODO:
 * - แสดงกราฟ usage (chat, image-to-video)
 * - แสดงสถิติ credits ที่ใช้ไป
 * - แสดง recent activities
 * - Export report
 */

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <Header
        title="Analytics"
        description="สถิติการใช้งานและ Performance"
      />

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Chats</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Videos Created</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Credits Used</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Chat + Image credits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Days</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              กราฟและรายงานโดยละเอียดกำลังพัฒนา...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              เร็วๆ นี้คุณจะสามารถดูสถิติและ export รายงานได้
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
