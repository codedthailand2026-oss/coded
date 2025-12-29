/**
 * Analytics Feature - Usage Statistics Dashboard
 *
 * แสดงสถิติการใช้งานระบบและ export เป็น Excel
 *
 * Features:
 * - Daily/Weekly/Monthly usage stats
 * - Credit consumption breakdown
 * - Top features used
 * - Export to Excel (XLSX format)
 * - Date range filtering
 */

'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as XLSX from 'xlsx';

interface AnalyticsData {
  totalUsers: number;
  totalCreditsUsed: number;
  totalGenerations: number;
  featureBreakdown: {
    chat: number;
    image: number;
    video: number;
    audio: number;
  };
  dailyStats: Array<{
    date: string;
    users: number;
    credits: number;
    generations: number;
  }>;
}

type TimeRange = 'today' | 'week' | 'month' | 'year';

export function AnalyticsFeature() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCreditsUsed: 0,
    totalGenerations: 0,
    featureBreakdown: {
      chat: 0,
      image: 0,
      video: 0,
      audio: 0,
    },
    dailyStats: [],
  });

  // === FETCH ANALYTICS DATA ===
  // ดึงข้อมูลจาก API ตาม time range ที่เลือก
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?range=${timeRange}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // === EXPORT TO EXCEL ===
  // Export ข้อมูล analytics เป็น Excel file
  // สร้าง multiple sheets: Overview, Daily Stats, Feature Breakdown
  const handleExport = async () => {
    setExporting(true);

    try {
      // Sheet 1: Overview
      const overviewData = [
        ['Metric', 'Value'],
        ['Total Users', data.totalUsers],
        ['Total Credits Used', data.totalCreditsUsed],
        ['Total Generations', data.totalGenerations],
        ['Chat Usage', data.featureBreakdown.chat],
        ['Image Usage', data.featureBreakdown.image],
        ['Video Usage', data.featureBreakdown.video],
        ['Audio Usage', data.featureBreakdown.audio],
      ];

      // Sheet 2: Daily Stats
      const dailyStatsData = [
        ['Date', 'Users', 'Credits', 'Generations'],
        ...data.dailyStats.map((stat) => [
          stat.date,
          stat.users,
          stat.credits,
          stat.generations,
        ]),
      ];

      // สร้าง workbook
      const wb = XLSX.utils.book_new();

      // เพิ่ม sheets
      const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
      const wsDailyStats = XLSX.utils.aoa_to_sheet(dailyStatsData);

      XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');
      XLSX.utils.book_append_sheet(wb, wsDailyStats, 'Daily Stats');

      // ตั้งชื่อไฟล์ตาม date range
      const filename = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('เกิดข้อผิดพลาดในการ export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              สถิติการใช้งานและรายงานต่างๆ
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="week">7 วันล่าสุด</SelectItem>
                <SelectItem value="month">30 วันล่าสุด</SelectItem>
                <SelectItem value="year">ปีนี้</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={loading || exporting}
              className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลัง Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Users</CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                {loading ? '...' : data.totalUsers.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Credits Used */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Credits Used</CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                {loading ? '...' : data.totalCreditsUsed.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Total Generations */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Generations</CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                {loading ? '...' : data.totalGenerations.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Avg per User */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Avg Credits/User</CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                {loading
                  ? '...'
                  : data.totalUsers > 0
                  ? Math.round(data.totalCreditsUsed / data.totalUsers)
                  : 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Feature Breakdown */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Feature Usage Breakdown</CardTitle>
            <CardDescription>จำนวนครั้งที่ใช้แต่ละ feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="text-xs text-muted-foreground mb-1">Chat</div>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : data.featureBreakdown.chat.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="text-xs text-muted-foreground mb-1">Image</div>
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : data.featureBreakdown.image.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                <div className="text-xs text-muted-foreground mb-1">Video</div>
                <div className="text-2xl font-bold text-pink-600">
                  {loading ? '...' : data.featureBreakdown.video.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="text-xs text-muted-foreground mb-1">Audio</div>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : data.featureBreakdown.audio.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Stats Table */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Daily Statistics</CardTitle>
            <CardDescription>สถิติรายวัน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Users</th>
                    <th className="text-right p-2">Credits</th>
                    <th className="text-right p-2">Generations</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-muted-foreground">
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : data.dailyStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-muted-foreground">
                        ไม่มีข้อมูล
                      </td>
                    </tr>
                  ) : (
                    data.dailyStats.map((stat, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2">{stat.date}</td>
                        <td className="text-right p-2">{stat.users.toLocaleString()}</td>
                        <td className="text-right p-2">{stat.credits.toLocaleString()}</td>
                        <td className="text-right p-2">{stat.generations.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
