# 🚀 Build APK ฟรีบน GitHub (ไม่ต้องลงอะไรบนคอม!)

วิธีนี้ใช้ **GitHub Actions** ที่ให้บริการฟรี — server ของ GitHub จะ build APK ให้คุณ คุณดาวน์โหลด `.apk` ได้จากเว็บเลย ไม่ต้องลง Android Studio / Java / SDK

**ข้อดี**: ไม่กิน RAM เครื่องคุณ, ไม่ต้องกังวลเรื่อง path/env variables, ทุกครั้งที่แก้โค้ด build ใหม่อัตโนมัติ
**ข้อเสีย**: ต้อง upload โค้ดขึ้น GitHub (ตั้ง private repo ได้ — ฟรี)
**เวลาที่ใช้**: ครั้งแรก 10-15 นาที, ครั้งต่อๆ ไป ~5 นาทีต่อ build

---

## ขั้นตอน

### 1) สมัคร GitHub (ถ้ายังไม่มี)
- ไป https://github.com/signup
- ใช้ email ฟรี

### 2) สร้าง Repository ใหม่
1. กด **+** (มุมขวาบน) → **New repository**
2. Repository name: `survey-app` (หรือชื่ออะไรก็ได้)
3. เลือก **Private** (ถ้าไม่อยากให้คนอื่นเห็นโค้ด)
4. **อย่า**ติ๊ก "Add a README file" หรือ ".gitignore" หรือ "license" — เลือกเปล่าๆ ดีกว่า
5. กด **Create repository**

GitHub จะแสดงคำสั่งที่ต้องรัน — เก็บหน้านี้ไว้

### 3) ติดตั้ง Git บน Windows (ครั้งเดียว)
ถ้ายังไม่มี Git:
- ดาวน์โหลด https://git-scm.com/download/win
- ติดตั้งแบบ Next-Next-Finish (ใช้ค่า default ได้หมด)

ตรวจสอบ:
```powershell
git --version
```

### 4) ตั้งค่า Git ครั้งแรก (ครั้งเดียวต่อเครื่อง)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 5) Push โค้ดขึ้น GitHub

เปิด PowerShell ใน folder `SurveyApp` (ที่แตก zip มา):

```powershell
cd C:\Projects\SurveyApp

# Initialize git
git init
git branch -M main

# Stage ทุกไฟล์
git add .
git commit -m "Initial commit"

# เชื่อมกับ GitHub (เปลี่ยน URL ให้ตรงกับของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/survey-app.git

# Push
git push -u origin main
```

> **หมายเหตุ**: ครั้งแรก GitHub จะเด้งขอ login — ใช้ browser login ตามปกติ
> หรือต้องสร้าง Personal Access Token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → ติ๊ก `repo` scope → คัดลอกไปใช้แทน password

### 6) ดู Build อัตโนมัติเริ่มทำงาน

1. กลับไปที่หน้า GitHub repository ของคุณ
2. คลิก tab **Actions** (ด้านบน)
3. จะเห็น workflow ชื่อ "Build Android APK" กำลังรัน — มีจุดสีเหลือง (running) หรือสีเขียว (success)
4. คลิกเข้าไปดูรายละเอียดได้

ใช้เวลาประมาณ **5-8 นาที** สำหรับครั้งแรก (ต้องดาวน์โหลด Android SDK)

### 7) ดาวน์โหลด APK

หลัง build เสร็จ (เห็น ✅ สีเขียว):
1. คลิกที่ workflow run ที่เพิ่งจบ
2. เลื่อนลงไปด้านล่างสุด — section **Artifacts**
3. คลิกที่ชื่อ **SurveyApp-debug** → จะดาวน์โหลดเป็นไฟล์ zip
4. แตก zip จะได้ `app-debug.apk`
5. ส่งเข้ามือถือ (Line/Drive/Email) → กดติดตั้ง

🎉 เสร็จแล้ว! ไม่ต้องลง Android Studio บนคอมเลย

---

## เวลาแก้โค้ดในอนาคต

หลังแก้ไฟล์ใน `www/index.html` หรือไฟล์อื่นๆ:

```powershell
git add .
git commit -m "อธิบายว่าแก้อะไร"
git push
```

GitHub Actions จะ build APK ใหม่ให้อัตโนมัติทันทีที่ push — ไม่ต้องทำอะไรเพิ่มเลย

---

## ปัญหาที่พบบ่อย

### ❌ Build fail — หา error ได้จากไหน
1. ไปที่ tab **Actions** ของ repo
2. คลิก workflow run ที่ fail (ตัวที่มี ❌)
3. คลิกที่ job **Build Debug APK**
4. ดู step ที่มีจุดแดง — ดู log ข้อผิดพลาด

ถ้าอ่านไม่ออก ส่ง screenshot ของ error log มาให้ผม จะช่วยดู

### ❌ "Permission denied" ตอน push
- ตรวจว่า login ถูก account
- ถ้าใช้ HTTPS URL ต้องสร้าง Personal Access Token (วิธีอยู่ในขั้นที่ 5)

### ❌ "Repository already exists"
- ถ้าทำผิดพลาดอยากเริ่มใหม่: ไปที่ repo บน GitHub → Settings → ลงสุดหน้า → **Delete this repository**

### ❌ ไม่เห็น tab Actions
- ตรวจว่าไฟล์ `.github/workflows/build-android.yml` ถูก push ขึ้นไป
- ใน repo ตรวจว่ามี `.github/workflows/` folder

### ❌ Workflow ไม่รันอัตโนมัติ
- ตรวจ branch name — workflow รันเมื่อ push ไปยัง `main` หรือ `master`
- รัน manual: tab Actions → คลิก workflow → กดปุ่ม **Run workflow**

### ❌ APK ติดตั้งบนมือถือไม่ได้
- เปิดสิทธิ์ "Install unknown apps" ใน Settings ของแอปที่ใช้เปิดไฟล์ (Chrome, Drive, etc.)
- ถ้าเคยติดตั้งเวอร์ชันเก่าแล้วอัปเดตไม่ได้: uninstall ออกก่อน (เพราะ signature ของ debug build เปลี่ยนทุก build)

### ⚠️ ห้ามลืม: แก้ WEB_APP_URL ก่อน push!
ก่อน push ครั้งแรก เปิด `www/index.html` ตรวจให้แน่ใจว่า:
```javascript
const WEB_APP_URL = "https://script.google.com/macros/s/.../exec";
```
เป็น URL ที่ Apps Script deploy แล้ว

---

## ค่าใช้จ่าย / ข้อจำกัด

GitHub Actions ฟรีสำหรับ:
- Public repos: **ไม่จำกัด**
- Private repos: **2,000 นาที/เดือน** (เกินพอสำหรับงาน hobby — แต่ละ build ใช้ ~5 นาที = 400 builds/เดือน)

ถ้าใช้เกินจะคิดเงินตามจริง แต่กรณีปกติไม่ถึง

---

## Build แบบ Release (.apk ที่ optimize แล้ว — สำหรับแจกจ่ายจริง)

Workflow ปัจจุบันทำเฉพาะ debug APK ซึ่ง:
- ✅ ติดตั้งได้ ใช้ได้ปกติ
- ❌ ไฟล์ใหญ่กว่าปกติ
- ❌ เร็วน้อยกว่า release
- ❌ Signed ด้วย debug key (อัปโหลด Play Store ไม่ได้)

ถ้าต้องการ Release APK + signing บอกได้ จะเพิ่ม workflow ให้

---

## คำถาม?
ถ้าติดขั้นตอนไหน ส่ง screenshot ของหน้าจอ error มาได้เลย
