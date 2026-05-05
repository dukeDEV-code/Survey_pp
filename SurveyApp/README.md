# Survey App - Mobile (Android & iOS)

แอปสำรวจภาคสนามแบบ native บน Android และ iOS  
สร้างจากโค้ด Google Apps Script + Leaflet เดิม โดยใช้ **Capacitor** ห่อหุ้มเป็น native app

---

## โครงสร้างไฟล์

```
SurveyApp/
├── package.json              # Dependencies
├── capacitor.config.json     # ตั้งค่า Capacitor
├── www/
│   └── index.html           # โค้ด UI (แก้แล้วให้รองรับมือถือ)
├── code.gs                   # Apps Script backend (อัปเดตใหม่)
├── README.md                 # ไฟล์นี้
└── BUILD_GUIDE.md            # คู่มือ build แอปแบบละเอียด
```

---

## สิ่งที่แก้ไขจากโค้ดเดิม

### 1. ไฟล์ HTML (`www/index.html`)
- **CORS fix**: เปลี่ยน `Content-Type` ของ `fetch` เป็น `text/plain;charset=utf-8` เพื่อหลีกเลี่ยง preflight OPTIONS request (ปัญหาหลักของการเรียก Apps Script จากแอป)
- **Export functions**: เปลี่ยนจาก `google.script.run` (ใช้ได้เฉพาะใน Apps Script web app) เป็น `callBackend` ผ่าน fetch
- **Geolocation**: เพิ่ม Capacitor Geolocation plugin สำหรับ GPS แบบ native (แม่นยำกว่า + ขอสิทธิ์ได้)
- **Safe area**: รองรับ notch ของ iPhone (status bar ไม่ทับปุ่ม)
- **Splash screen**: แสดงตอนเปิดแอป
- **Disable text selection** บน UI elements (ยังเลือกได้ใน input/textarea)
- **Web Share API**: ตอน export CSV/GeoJSON สามารถเปิดเมนู share ของระบบได้
- **Upload KML to Drive**: เพิ่มฟังก์ชัน `uploadFileDirectToDrive` ที่ขาดในโค้ดเดิม

### 2. ไฟล์ Apps Script (`code.gs`)
- เพิ่ม action ใน `doPost`:
  - `exportCSV` - export ข้อมูลเป็น CSV
  - `exportGeoJSON` - export เป็น GeoJSON
  - `uploadKml` - อัปโหลดไฟล์ KML/KMZ ขึ้น Drive
- ปรับปรุง CSV escape (ใส่ quote ให้ field ที่มี comma/newline)
- เพิ่ม error handling ใน `doPost`

---

## ขั้นตอนการใช้งาน (สรุปย่อ)

### A. Deploy Apps Script ใหม่
1. คัดลอกโค้ดใน `code.gs` ไปทับใน Apps Script editor ของคุณ
2. กด **Deploy → Manage deployments → Edit (แก้ไข)** หรือ **New deployment**
3. **Execute as**: Me
4. **Who has access**: Anyone (สำคัญ! เพื่อให้แอปมือถือเข้าได้)
5. คัดลอก Web App URL ใหม่
6. แก้ค่า `WEB_APP_URL` ใน `www/index.html` (บรรทัดที่ขึ้นต้น `const WEB_APP_URL = ...`)

### B. Build แอป
ดูคู่มือละเอียดใน `BUILD_GUIDE.md`

โดยสรุป:
```bash
# 1. ติดตั้ง dependencies
npm install

# 2. เพิ่ม platform
npx cap add android
npx cap add ios

# 3. Sync code เข้าไปใน native projects
npx cap sync

# 4. เปิดใน Xcode (iOS) หรือ Android Studio
npx cap open ios
npx cap open android
```

แล้วใน Xcode/Android Studio กด Run

---

## คุณสมบัติของแอป

- ✅ แผนที่ Google Hybrid/Satellite/Standard/Terrain + OpenStreetMap
- ✅ GPS Live Tracking (ใช้ native Geolocation API)
- ✅ แตะแผนที่ → กรอกแบบฟอร์ม (รหัสที่ดิน + รูปภาพ + หมายเหตุ)
- ✅ ถ่ายรูปจากกล้อง / เลือกจากคลังภาพ
- ✅ บันทึกข้อมูล + รูปภาพขึ้น Google Sheets + Drive
- ✅ นำเข้า/ส่งออก KML/KMZ จาก Google Drive
- ✅ Export ข้อมูลเป็น CSV / GeoJSON
- ✅ รองรับ Safe area iPhone (notch)
- ✅ ทำงานทั้ง online (มี internet สำหรับเรียก Apps Script)

---

## ข้อจำกัด

- ⚠️ **ต้องมีอินเทอร์เน็ต** - แอปเรียก Apps Script เพื่อบันทึกข้อมูล หากต้องการ offline mode ต้องเพิ่ม IndexedDB cache (ขยายภายหลัง)
- ⚠️ **Tiles แผนที่ load จาก internet** - หากต้องการ offline tiles ต้องเพิ่ม Leaflet.offline plugin
- ⚠️ **Apps Script quota** - Google จำกัด 6 นาที/execution, 90 นาที/วัน รวม

---

## Permission ที่ขอ (ติดตั้งแอป)

### Android
- `ACCESS_FINE_LOCATION` - GPS ความละเอียดสูง
- `ACCESS_COARSE_LOCATION` - ตำแหน่งโดยประมาณ
- `INTERNET` - เชื่อมต่ออินเทอร์เน็ต
- `CAMERA` - ถ่ายรูป
- `READ_EXTERNAL_STORAGE` - อ่านรูปจากคลังภาพ

### iOS (Info.plist)
- `NSLocationWhenInUseUsageDescription` - เข้าถึง GPS
- `NSCameraUsageDescription` - ใช้กล้อง
- `NSPhotoLibraryUsageDescription` - เข้าถึงคลังภาพ

ดูวิธีตั้งค่าใน `BUILD_GUIDE.md`

---

## ทดสอบแบบเร็ว (โดยไม่ build เป็นแอป)

หากแค่อยาก preview UI ก่อน:
```bash
cd www
python3 -m http.server 8080
```
เปิด `http://localhost:8080` ในเบราว์เซอร์

หมายเหตุ: GPS อาจไม่ทำงานบน `http://` (ต้องใช้ `https://` หรือ `localhost`)
