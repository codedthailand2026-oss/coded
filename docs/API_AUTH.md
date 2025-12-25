# Authentication API Documentation

> เอกสารสำหรับ Backend Developer
> ระบุ API endpoints ที่ต้องสร้างสำหรับระบบ Authentication

---

## 📋 Overview

Frontend ได้สร้างหน้า Login และ Register เรียบร้อยแล้ว
ต้องการ API endpoints ดังนี้:

1. **POST /api/auth/register** - สมัครสมาชิก
2. **POST /api/auth/login** - เข้าสู่ระบบ
3. **POST /api/auth/logout** - ออกจากระบบ
4. **GET /api/auth/me** - ดึงข้อมูล user ปัจจุบัน

---

## 🔐 1. Register (สมัครสมาชิก)

### Endpoint
```
POST /api/auth/register
```

### Request Body
```json
{
  "name": "สมชาย ใจดี",
  "email": "somchai@email.com",
  "password": "SecurePass123"
}
```

### Validation Rules
- **name**: required, string, min 2 characters
- **email**: required, valid email format, unique
- **password**: required, min 8 characters, must contain:
  - ตัวพิมพ์เล็ก (a-z)
  - ตัวพิมพ์ใหญ่ (A-Z)
  - ตัวเลข (0-9)

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "สมชาย ใจดี",
      "email": "somchai@email.com",
      "created_at": "2024-12-25T10:00:00Z"
    },
    "token": "jwt-token-here"
  },
  "meta": {
    "message": "สมัครสมาชิกสำเร็จ"
  }
}
```

### Error Responses

**400 Bad Request** - ข้อมูลไม่ถูกต้อง
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อมูลไม่ถูกต้อง",
    "details": {
      "email": "รูปแบบอีเมลไม่ถูกต้อง",
      "password": "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
    }
  }
}
```

**409 Conflict** - อีเมลซ้ำ
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "อีเมลนี้ถูกใช้งานแล้ว"
  }
}
```

### Backend Tasks After Registration

1. **สร้าง User Record** ใน `auth.users` (Supabase)
2. **สร้าง Profile** ใน table `profiles`:
   ```sql
   INSERT INTO profiles (id, name, email, created_at, updated_at)
   VALUES (user_id, name, email, NOW(), NOW());
   ```

3. **สร้าง Subscription** ใน table `subscriptions`:
   ```sql
   INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
   VALUES (
     user_id,
     (SELECT id FROM plans WHERE name = 'free'),
     'active',
     NOW(),
     NOW() + INTERVAL '1 month'
   );
   ```

4. **สร้าง Credits** ใน table `credits`:
   ```sql
   INSERT INTO credits (user_id, chat_credits, image_credits, bonus_chat_credits, bonus_image_credits)
   VALUES (user_id, 50, 3, 0, 0);
   ```

5. **ส่ง Email ยืนยัน** (Optional - ข้ามได้ถ้า SMTP มีปัญหา)

---

## 🔑 2. Login (เข้าสู่ระบบ)

### Endpoint
```
POST /api/auth/login
```

### Request Body
```json
{
  "email": "somchai@email.com",
  "password": "SecurePass123"
}
```

### Validation Rules
- **email**: required, valid email format
- **password**: required

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "สมชาย ใจดี",
      "email": "somchai@email.com",
      "avatar": null,
      "plan": "free"
    },
    "credits": {
      "chat_credits": 50,
      "image_credits": 3,
      "bonus_chat_credits": 0,
      "bonus_image_credits": 0
    },
    "token": "jwt-token-here"
  },
  "meta": {
    "message": "เข้าสู่ระบบสำเร็จ"
  }
}
```

### Error Responses

**401 Unauthorized** - อีเมลหรือรหัสผ่านผิด
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
  }
}
```

**403 Forbidden** - บัญชีถูกระงับ
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SUSPENDED",
    "message": "บัญชีของคุณถูกระงับ กรุณาติดต่อฝ่ายสนับสนุน"
  }
}
```

### Backend Tasks

1. ตรวจสอบ email และ password
2. ดึงข้อมูล user + profile + credits + subscription
3. สร้าง JWT token
4. Return ข้อมูลครบถ้วน

---

## 🚪 3. Logout (ออกจากระบบ)

### Endpoint
```
POST /api/auth/logout
```

### Headers
```
Authorization: Bearer <jwt-token>
```

### Success Response (200 OK)
```json
{
  "success": true,
  "meta": {
    "message": "ออกจากระบบสำเร็จ"
  }
}
```

### Backend Tasks

1. Invalidate JWT token (ถ้าใช้ token blacklist)
2. หรือให้ frontend ลบ token (simpler approach)

---

## 👤 4. Get Current User (ดึงข้อมูล User ปัจจุบัน)

### Endpoint
```
GET /api/auth/me
```

### Headers
```
Authorization: Bearer <jwt-token>
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "สมชาย ใจดี",
      "email": "somchai@email.com",
      "avatar": "https://...",
      "created_at": "2024-12-25T10:00:00Z"
    },
    "subscription": {
      "plan": "free",
      "status": "active",
      "current_period_end": "2025-01-25T10:00:00Z"
    },
    "credits": {
      "chat_credits": 45,
      "image_credits": 2,
      "bonus_chat_credits": 0,
      "bonus_image_credits": 0
    }
  }
}
```

### Error Responses

**401 Unauthorized** - Token ไม่ถูกต้องหรือหมดอายุ
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "กรุณาเข้าสู่ระบบ"
  }
}
```

---

## 🔒 JWT Token Requirements

### Token Payload
```json
{
  "user_id": "uuid-here",
  "email": "somchai@email.com",
  "exp": 1640000000,
  "iat": 1639990000
}
```

### Token Expiration
- **Access Token**: 24 ชั่วโมง
- **Refresh Token** (Optional): 30 วัน

---

## 📊 Database Schema Reference

### ตรวจสอบ schema ที่ต้องใช้:

1. **auth.users** (Supabase built-in)
2. **profiles** - ข้อมูล user
3. **subscriptions** - subscription ปัจจุบัน
4. **credits** - credits คงเหลือ
5. **plans** - แผนบริการ (มี 4 plans: free, starter, pro, enterprise)

ดู schema เต็มที่: `docs/DATABASE.md`

---

## ⚡ Important Notes

### Security
- ใช้ bcrypt หรือ argon2 สำหรับ hash password
- Validate input ทุก field
- Rate limiting: 5 requests / minute สำหรับ login
- HTTPS only

### Error Handling
- ใช้ format เดียวกับ `docs/API_FORMAT.md`
- Error codes ต้องชัดเจน (VALIDATION_ERROR, INVALID_CREDENTIALS, etc.)
- Message เป็นภาษาไทยที่เข้าใจง่าย

### CORS
- Allow origin: Frontend URL
- Allow methods: POST, GET
- Allow headers: Content-Type, Authorization

---

## 🧪 Testing Checklist

### Register
- [ ] สมัครสำเร็จด้วยข้อมูลถูกต้อง
- [ ] ป้องกันอีเมลซ้ำ
- [ ] Validate password strength
- [ ] สร้าง profile, subscription, credits อัตโนมัติ

### Login
- [ ] Login สำเร็จด้วย email + password ถูกต้อง
- [ ] ป้องกัน brute force (rate limiting)
- [ ] Return ข้อมูล user + credits ครบถ้วน

### Logout & Get User
- [ ] Logout invalidate token
- [ ] GET /api/auth/me ต้องใช้ token
- [ ] Return 401 เมื่อ token หมดอายุ

---

## 📞 Contact

มีคำถามเพิ่มเติม ติดต่อ:
- Frontend Team: [ใส่ contact]
- Database Schema: ดูที่ `docs/DATABASE.md`
- API Format: ดูที่ `docs/API_FORMAT.md`

---

**สร้างโดย Frontend Team - 25 Dec 2024**
