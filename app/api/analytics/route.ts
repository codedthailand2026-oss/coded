/**
 * Analytics API
 *
 * GET /api/analytics?range=month
 *
 * ดึงข้อมูลสถิติการใช้งาน:
 * - Total users
 * - Total credits used
 * - Total generations
 * - Feature breakdown
 * - Daily stats
 *
 * Query params:
 * - range: 'today' | 'week' | 'month' | 'year'
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // === CHECK AUTH ===
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'กรุณาเข้าสู่ระบบ',
          },
        },
        { status: 401 }
      );
    }

    // === GET TIME RANGE ===
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'month';

    let startDate: Date;
    const now = new Date();

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // === QUERY ANALYTICS DATA ===
    // TODO: Replace with real queries to usage_logs table
    // ตอนนี้ return mock data ก่อน เมื่อมี usage_logs table จริงแล้วค่อยแก้

    // Mock data สำหรับ demo
    const mockData = {
      totalUsers: 150,
      totalCreditsUsed: 5420,
      totalGenerations: 890,
      featureBreakdown: {
        chat: 450,
        image: 280,
        video: 120,
        audio: 40,
      },
      dailyStats: generateMockDailyStats(startDate, now),
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      meta: {
        range,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
        },
      },
      { status: 500 }
    );
  }
}

// === HELPER FUNCTION ===
// สร้าง mock daily stats
function generateMockDailyStats(startDate: Date, endDate: Date) {
  const stats = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    stats.push({
      date: current.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 50) + 10,
      credits: Math.floor(Math.random() * 200) + 50,
      generations: Math.floor(Math.random() * 50) + 5,
    });

    current.setDate(current.getDate() + 1);
  }

  return stats;
}

// TODO: Real query example (uncomment เมื่อมี usage_logs table):
/*
// === QUERY USAGE LOGS ===
const { data: usageLogs, error } = await supabase
  .from('usage_logs')
  .select('*')
  .gte('created_at', startDate.toISOString())
  .lte('created_at', now.toISOString());

if (error) throw error;

// === CALCULATE STATS ===
const totalGenerations = usageLogs.length;
const totalCreditsUsed = usageLogs.reduce((sum, log) => sum + log.credits_used, 0);

// Count unique users
const uniqueUsers = new Set(usageLogs.map(log => log.user_id));
const totalUsers = uniqueUsers.size;

// Feature breakdown
const featureBreakdown = {
  chat: usageLogs.filter(log => log.feature_type === 'chat').length,
  image: usageLogs.filter(log => log.feature_type === 'image').length,
  video: usageLogs.filter(log => log.feature_type === 'video').length,
  audio: usageLogs.filter(log => log.feature_type === 'audio').length,
};

// Daily stats
const dailyStatsMap = new Map();
usageLogs.forEach(log => {
  const date = log.created_at.split('T')[0];
  if (!dailyStatsMap.has(date)) {
    dailyStatsMap.set(date, {
      date,
      users: new Set(),
      credits: 0,
      generations: 0,
    });
  }

  const stat = dailyStatsMap.get(date);
  stat.users.add(log.user_id);
  stat.credits += log.credits_used;
  stat.generations += 1;
});

const dailyStats = Array.from(dailyStatsMap.values()).map(stat => ({
  date: stat.date,
  users: stat.users.size,
  credits: stat.credits,
  generations: stat.generations,
}));
*/
