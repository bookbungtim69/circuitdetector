# 🔬 Arduino Nano + LED Circuit Detector (AI Vision)

ระบบตรวจจับและวิเคราะห์การเชื่อมต่อวงจร **Arduino Nano + LED บน Breadboard** ผ่านกล้องแบบเรียลไทม์ ด้วย AI Computer Vision

![Circuit Detector Banner](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **กล้องสดและอัปโหลดภาพ (Live Camera & Image Upload)**:
   - สตรีมกล้อง Webcam และกล้องสมาร์ตโฟน (สลับกล้องหน้า/กล้องหลังได้)
   - มีเส้นเล็ง AR Guide ช่วยจัดตำแหน่ง Arduino Nano, Breadboard, LED และตัวต้านทาน
   - รองรับการลากวางไฟล์ภาพ (Drag & Drop)

2. **AI Vision & Circuit Inspection Engine**:
   - ตรวจจับขาพินของ Arduino Nano (D13, D2-D12, GND, 5V, 3V3, RST)
   - ตรวจสอบขั้ว LED ขั้วบวก (Anode / ขายาว) และขั้วลบ (Cathode / ขาสั้น)
   - ตรวจสอบตัวต้านทานจำกัดกระแส (Current-Limiting Resistor 220Ω - 1kΩ)
   - ตรวจจับเส้นทางสายไฟ Jumper Wire และจุดเชื่อมต่อบน Breadboard
   - ประเมินสถานะวงจร: **CORRECT (ต่อถูก)** / **INCORRECT (ต่อผิด)** / **WARNING (เตือนอันตราย)**

3. **Visual Diagnostic Overlay**:
   - วาดกรอบสี่เหลี่ยม Bounding Box และป้ายกำกับชี้จุดบนภาพ
   - แสดงสีเขียวสำหรับจุดที่ต่อถูกต้อง และสีแดง/ส้มสำหรับจุดที่ผิดพลาด
   - มีเสียงแจ้งเตือนความถูกต้อง (Audio Chime / Alert Buzzer) และเอฟเฟกต์ Confetti

4. **คลังภาพตัวอย่างทดสอบ (Sample Test Gallery)**:
   - กรณีที่ 1: วงจรต่อถูกต้องสมบูรณ์ (PASS)
   - กรณีที่ 2: ต่อหลอด LED สลับขั้ว (FAIL)
   - กรณีที่ 3: ลืมต่อตัวต้านทาน เสี่ยงกระแสเกิน (WARNING)
   - กรณีที่ 4: เสียบสายไฟผิดพิน เช่น ไปเสียบที่ขา RST/3V3 (FAIL)

5. **แผนผังวงจรและโค้ด Arduino (Interactive Schematic & Code)**:
   - ไดอะแกรมวงจรจำลองมาตรฐาน
   - โค้ดตัวอย่าง Arduino `Blink.ino` พร้อมปุ่มคัดลอก

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS, Electronics Cyber Modern UI
- **AI Vision**: Google Gemini 2.5 Flash / 1.5 Flash Vision (`@google/generative-ai`)
- **Icons & Effects**: Lucide React, Canvas-Confetti, Web Audio API

---

## 🚀 วิธีติดตั้งและรันในเครื่อง (Local Setup)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่า Environment Variables (ถ้ามี)
cp .env.example .env.local
# ใส่ GEMINI_API_KEY=your_key ใน .env.local (หรือใส่ผ่านหน้าเว็บได้โดยตรง)

# 3. รัน Development Server
npm run dev

# 4. เปิดเบราว์เซอร์ที่ http://localhost:3000
```

---

## ☁️ วิธีการ Deploy บน Vercel (Deploy on Vercel.com)

1. นำ Repository ขึ้น GitHub (`https://github.com/bookbungtim69/circuitdetector.git`)
2. เข้าสู่ [vercel.com](https://vercel.com) และล็อกอินด้วยบัญชี GitHub
3. กดปุ่ม **"Add New Project"** แล้วเลือก Repository `circuitdetector`
4. ในส่วน **Environment Variables** เพิ่มตัวแปร:
   - `GEMINI_API_KEY`: ใส่ API Key ของคุณที่ได้จาก [Google AI Studio](https://aistudio.google.com/app/apikey)
5. กด **Deploy** เว็บแอปพลิเคชันจะพร้อมใช้งานทันที!

---

## 📦 GitHub Repository

- **Repository URL**: [https://github.com/bookbungtim69/circuitdetector.git](https://github.com/bookbungtim69/circuitdetector.git)
