# Automation Guide - Daily Report to LINE

คู่มือการตั้งค่า automation สำหรับส่ง Daily Report เข้า LINE Group อัตโนมัติ

---

## 🎯 ภาพรวม

ระบบจะส่ง report สรุปการใช้งานรายวันเข้า LINE Group ทุกวันเวลา 09:00 น.

**Report ประกอบด้วย:**
- จำนวน users ที่ใช้งานวันนี้
- จำนวน credits ที่ใช้ไป
- จำนวนครั้งที่สร้าง content (Chat, Image, Video, Audio)
- Feature ยอดนิยม
- Comparison กับวันก่อนหน้า

---

## 🛠️ Architecture

```
┌─────────────┐      ┌─────────┐      ┌──────────────┐      ┌─────────────┐
│  Supabase   │─────>│  n8n    │─────>│ LINE Notify  │─────>│ LINE Group  │
│  Database   │      │ Workflow│      │     API      │      │             │
└─────────────┘      └─────────┘      └──────────────┘      └─────────────┘
     (Data)         (Schedule +         (Messaging)         (Notification)
                     Format)
```

**ทำไมใช้ n8n:**
- Project ใช้ n8n สำหรับ AI workflows อยู่แล้ว
- Visual workflow builder (ไม่ต้องเขียน code)
- Built-in scheduler
- มี LINE Notify integration
- ง่ายต่อการ maintain

---

## 📋 สิ่งที่ต้องเตรียม

### 1. LINE Notify Token

LINE Notify เป็นบริการฟรีของ LINE สำหรับส่งข้อความเข้ากลุ่ม

**ขั้นตอน:**

1. ไปที่ [LINE Notify](https://notify-bot.line.me/)
2. Login ด้วย LINE account
3. ไปที่ **My page** → **Generate token**
4. กรอกข้อมูล:
   - Token name: `Coded Daily Report`
   - Select group: เลือกกลุ่มที่ต้องการส่ง report
5. กด **Generate token**
6. **คัดลอก token ทันที** (จะแสดงครั้งเดียว)
7. เก็บ token ไว้ที่ปลอดภัย

**Token ตัวอย่าง:**
```
YOUR_LINE_NOTIFY_TOKEN_HERE
```
(Token จริงจะเป็นรหัสยาวๆ เก็บไว้ในที่ปลอดภัย)

### 2. n8n Cloud Account

**ถ้ายังไม่มี:**
1. ไปที่ [n8n.cloud](https://n8n.cloud)
2. Sign up (มี free tier 5,000 workflow executions/month)
3. สร้าง workspace ใหม่

**ถ้ามีอยู่แล้ว:**
- ใช้ workspace เดียวกับที่ทำ AI workflows

---

## 🔧 Setup n8n Workflow

### Step 1: Create Workflow

1. Login เข้า n8n.cloud
2. กด **New Workflow**
3. ตั้งชื่อ: `Daily Report to LINE`

### Step 2: เพิ่ม Schedule Trigger

1. เพิ่ม node: **Schedule Trigger**
2. ตั้งค่า:
   ```
   Trigger Interval: Every Day
   Hour: 9
   Minute: 0
   Timezone: Asia/Bangkok
   ```
3. คลิก **Save**

### Step 3: Query Analytics Data

1. เพิ่ม node: **HTTP Request**
2. ตั้งค่า:
   ```
   Method: GET
   URL: https://yourdomain.com/api/analytics?range=today
   Authentication: None (ถ้าเป็น internal API ใช้ API key)
   ```
3. Test node เพื่อดูข้อมูล

**ตัวอย่าง Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 45,
    "totalCreditsUsed": 320,
    "totalGenerations": 89,
    "featureBreakdown": {
      "chat": 50,
      "image": 25,
      "video": 10,
      "audio": 4
    }
  }
}
```

### Step 4: Format Message

1. เพิ่ม node: **Code**
2. Language: **JavaScript**
3. Code:

```javascript
// รับข้อมูลจาก HTTP Request
const data = $input.item.json.data;

// สร้างข้อความ report
const message = `
📊 Daily Report - ${new Date().toLocaleDateString('th-TH')}

👥 Users: ${data.totalUsers} คน
⚡ Credits Used: ${data.totalCreditsUsed.toLocaleString()}
🎨 Generations: ${data.totalGenerations}

📈 Feature Breakdown:
• Chat: ${data.featureBreakdown.chat}
• Image: ${data.featureBreakdown.image}
• Video: ${data.featureBreakdown.video}
• Audio: ${data.featureBreakdown.audio}

🔥 Top Feature: ${getTopFeature(data.featureBreakdown)}
`;

// หา feature ที่ใช้มากที่สุด
function getTopFeature(breakdown) {
  const entries = Object.entries(breakdown);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return `${sorted[0][0]} (${sorted[0][1]} ครั้ง)`;
}

// Return formatted message
return { message };
```

### Step 5: Send to LINE

1. เพิ่ม node: **HTTP Request**
2. ตั้งค่า:
   ```
   Method: POST
   URL: https://notify-api.line.me/api/notify
   Authentication: Header Auth
   Header:
     - Name: Authorization
     - Value: Bearer YOUR_LINE_NOTIFY_TOKEN
   Body Content Type: Form-Data
   Body Parameters:
     - Name: message
     - Value: {{ $json.message }}
   ```
3. แทนที่ `YOUR_LINE_NOTIFY_TOKEN` ด้วย token ที่ได้จาก LINE Notify

### Step 6: Error Handling (Optional)

1. เพิ่ม node: **IF**
2. Condition: `{{ $json.success }} === true`
3. ถ้า false → Send error notification

### Step 7: Activate Workflow

1. กด **Active** ที่มุมบนขวา
2. Workflow จะทำงานอัตโนมัติทุกวัน 09:00 น.

---

## 🧪 Testing

### ทดสอบทันที (ไม่รอถึง 09:00)

1. ใน n8n คลิก node **Schedule Trigger**
2. กด **Execute Node** (ปุ่มเล่น)
3. ตรวจสอบ LINE Group ว่าได้รับข้อความหรือไม่

### ทดสอบเฉพาะ LINE Notify

ใช้ curl command:

```bash
curl -X POST https://notify-api.line.me/api/notify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "message=Test message from n8n"
```

ถ้าสำเร็จจะเห็นข้อความใน LINE Group

---

## 📊 ตัวอย่าง Report Message

```
📊 Daily Report - 29/12/2024

👥 Users: 45 คน
⚡ Credits Used: 1,250
🎨 Generations: 89

📈 Feature Breakdown:
• Chat: 50
• Image: 25
• Video: 10
• Audio: 4

🔥 Top Feature: Chat (50 ครั้ง)

📈 Trend: +15% จากเมื่อวาน
```

---

## 🎨 Customization

### เพิ่ม Emoji และ Styling

```javascript
const message = `
╔═══════════════════════════╗
║   📊 DAILY REPORT 📊      ║
╚═══════════════════════════╝

📅 ${new Date().toLocaleDateString('th-TH', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

━━━━━━━━━━━━━━━━━━━━━━━━━
        💡 Overview
━━━━━━━━━━━━━━━━━━━━━━━━━
👥 Active Users: ${data.totalUsers}
⚡ Credits Used: ${data.totalCreditsUsed.toLocaleString()}
🎨 Total Generations: ${data.totalGenerations}

━━━━━━━━━━━━━━━━━━━━━━━━━
     📈 Feature Usage
━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Chat: ${data.featureBreakdown.chat}
🖼️  Image: ${data.featureBreakdown.image}
🎬 Video: ${data.featureBreakdown.video}
🎙️  Audio: ${data.featureBreakdown.audio}

🏆 Top Feature: ${getTopFeature(data.featureBreakdown)}
`;
```

### เพิ่ม Comparison กับวันก่อน

```javascript
// Query ข้อมูลเมื่อวาน
const yesterday = $('HTTP Request Yesterday').item.json.data;
const today = $('HTTP Request Today').item.json.data;

// คำนวณ % เปลี่ยนแปลง
const change = ((today.totalUsers - yesterday.totalUsers) / yesterday.totalUsers * 100).toFixed(1);
const emoji = change > 0 ? '📈' : '📉';

const message = `
...
📊 Comparison:
${emoji} Users: ${change}% vs yesterday
`;
```

### เพิ่ม Chart/Graph (Advanced)

ใช้ QuickChart API สร้างกราฟ:

```javascript
// สร้าง URL สำหรับกราฟ
const chartUrl = `https://quickchart.io/chart?c={
  type: 'bar',
  data: {
    labels: ['Chat', 'Image', 'Video', 'Audio'],
    datasets: [{
      label: 'Usage',
      data: [${data.featureBreakdown.chat}, ${data.featureBreakdown.image}, ${data.featureBreakdown.video}, ${data.featureBreakdown.audio}]
    }]
  }
}`;

// Send both text and image
const message = `...`;
const imageUrl = chartUrl;
```

---

## 🔐 Security Best Practices

### 1. เก็บ Secrets อย่างปลอดภัย

ใน n8n Cloud:
- ไปที่ **Settings** → **Credentials**
- สร้าง credential ใหม่ชื่อ `LINE Notify Token`
- เก็บ token ไว้ที่นี่
- ใช้ใน workflow โดยเลือกจาก dropdown (ไม่ hardcode)

### 2. API Rate Limits

LINE Notify มี rate limit:
- 1,000 calls/hour per token
- ถ้าส่งเกินจะได้ HTTP 429

**วิธีแก้:**
- ส่งแค่ 1 ครั้ง/วัน (ไม่น่าเกิน)
- ถ้าต้องการส่งบ่อย → ใช้หลาย tokens

### 3. Monitoring

ตั้ง alert ใน n8n:
- ถ้า workflow fail → ส่ง email แจ้ง admin
- เพิ่ม node **IF** เช็ค success

---

## 🐛 Troubleshooting

### Report ไม่ส่ง

**1. Check Workflow Status**
- เข้า n8n → ดู Executions tab
- ถ้าเป็นสีแดง = error
- คลิกดูรายละเอียด error

**2. Check LINE Notify Token**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://notify-api.line.me/api/status
```
Response ควรได้:
```json
{
  "status": 200,
  "message": "ok"
}
```

**3. Check API Endpoint**
- ทดสอบ API โดยตรง: `https://yourdomain.com/api/analytics?range=today`
- ควรได้ JSON response

### ข้อความไม่ถูกต้อง

**1. Check Data Format**
- ใน n8n คลิก node HTTP Request
- ดูข้อมูลที่ได้จาก API
- ตรวจสอบว่า field names ตรงกับ code หรือไม่

**2. Test Code Node**
- คลิก node Code
- กด Execute Node
- ดู output ว่าได้ message ถูกต้องไหม

---

## 📅 Alternative: Using Vercel Cron Jobs

ถ้าไม่อยากใช้ n8n สามารถใช้ Vercel Cron Jobs (เพราะ host บน Vercel):

### 1. สร้าง API Route

```typescript
// app/api/cron/daily-report/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // ตรวจสอบ Cron Secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Query analytics data
    const analytics = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/analytics?range=today`);
    const data = await analytics.json();

    // 2. Format message
    const message = `
📊 Daily Report - ${new Date().toLocaleDateString('th-TH')}
👥 Users: ${data.data.totalUsers}
⚡ Credits: ${data.data.totalCreditsUsed}
    `;

    // 3. Send to LINE
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${encodeURIComponent(message)}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Daily report error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### 2. ตั้งค่า vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 3. Environment Variables

ใน Vercel Dashboard → Settings → Environment Variables:
```
LINE_NOTIFY_TOKEN=your_token_here
CRON_SECRET=random_secret_string
NEXT_PUBLIC_URL=https://yourdomain.com
```

### 4. Deploy

```bash
git add .
git commit -m "Add daily report cron"
git push
```

Vercel จะรัน cron ทุกวัน 09:00 UTC (16:00 ICT)

**ข้อดี:**
- ไม่ต้องพึ่ง external service
- Deploy พร้อม code
- ฟรี (Vercel free tier รองรับ cron)

**ข้อเสีย:**
- Timezone คือ UTC (ต้องคำนวณเอง)
- ไม่มี visual workflow builder
- Debug ยากกว่า n8n

---

## 🎯 Recommendation

**สำหรับโปรเจคนี้ → แนะนำใช้ n8n** เพราะ:
✅ ใช้ n8n สำหรับ AI workflows อยู่แล้ว
✅ Visual builder ง่ายต่อการแก้ไข
✅ Non-technical team members สามารถแก้ได้
✅ มี logging และ monitoring built-in

**ใช้ Vercel Cron เมื่อไหร่:**
- ต้องการ deploy ทุกอย่างใน repo เดียว
- ทีมเป็น developers ทั้งหมด
- ไม่ต้องการ external dependencies

---

## 📚 Resources

- [LINE Notify API Docs](https://notify-bot.line.me/doc/en/)
- [n8n Documentation](https://docs.n8n.io/)
- [QuickChart API](https://quickchart.io/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
