/**
 * Settings Page
 *
 * หน้าสำหรับจัดการ account settings
 *
 * TODO:
 * - Profile settings (name, email, avatar)
 * - Subscription management
 * - Payment method
 * - API keys (ถ้ามี)
 * - Notification preferences
 */

import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <MainLayout>
      <Header
        title="Settings"
        description="จัดการ account และ preferences"
      />

      <div className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                ข้อมูลส่วนตัวของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                จัดการ plan และ billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">Free Plan</p>
                </div>
                <Button>Upgrade</Button>
              </div>
            </CardContent>
          </Card>

          {/* Credits Section */}
          <Card>
            <CardHeader>
              <CardTitle>Credits</CardTitle>
              <CardDescription>
                Credits คงเหลือและประวัติการใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Chat Credits:</span>
                  <span className="font-medium">50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Image Credits:</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
