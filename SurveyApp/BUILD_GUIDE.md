# คู่มือ Build แอป Survey App (สำหรับ Mac)

คู่มือนี้จะพาคุณไปทีละขั้นตอน ตั้งแต่ติดตั้งเครื่องมือ จนได้ไฟล์ `.apk` (Android) และ `.ipa` (iOS)

---

## ขั้นตอนที่ 0: ติดตั้งเครื่องมือบน Mac

### 0.1 Node.js (จำเป็น)
```bash
# ติดตั้งผ่าน Homebrew (ถ้ามี)
brew install node

# ตรวจสอบ
node --version   # ควรเป็น v18 หรือสูงกว่า
npm --version
```

ถ้าไม่มี Homebrew → ดาวน์โหลด Node.js LTS จาก https://nodejs.org

### 0.2 Xcode (สำหรับ iOS - จำเป็นถ้าจะ build iOS)
- เปิด App Store → ค้นหา **Xcode** → ติดตั้ง (ฟรี แต่ขนาด ~10 GB)
- หลังติดตั้งเสร็จ เปิด Xcode 1 ครั้งเพื่อ accept license
- ใน Terminal:
  ```bash
  sudo xcode-select --install
  ```
- ติดตั้ง CocoaPods:
  ```bash
  sudo gem install cocoapods
  # หรือถ้า Mac ใหม่ (Apple Silicon) เจอปัญหา
  brew install cocoapods
  ```

### 0.3 Android Studio (สำหรับ Android)
- ดาวน์โหลดจาก https://developer.android.com/studio
- ลากไปใส่ Applications แล้วเปิด
- ตามขั้นตอน setup wizard (ติดตั้ง Android SDK, Platform Tools)
- ตั้งค่า environment variables ใน `~/.zshrc` (หรือ `~/.bash_profile`):
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
  แล้วรัน `source ~/.zshrc`

### 0.4 ตั้งค่า Java (สำหรับ Android - มักมาพร้อม Android Studio)
ตรวจสอบ:
```bash
java -version   # ควรเป็น 17 หรือ 21
```
ถ้าไม่มี:
```bash
brew install --cask zulu@17
```

---

## ขั้นตอนที่ 1: เตรียม Apps Script Backend

1. เปิด https://script.google.com/
2. เปิดโปรเจคเดิมของคุณ (หรือสร้างใหม่)
3. คัดลอกโค้ดทั้งหมดใน `code.gs` (ที่ผมแก้ใหม่แล้ว) ไปทับ
4. กด **Save (Ctrl+S / Cmd+S)**
5. กด **Deploy → Manage deployments**
6. กดดินสอ ✏️ (Edit) บน deployment เดิม → **Version: New version** → **Deploy**
   - หรือถ้ายังไม่มี → **New deployment**:
     - Select type: **Web app**
     - Description: Survey API
     - Execute as: **Me**
     - Who has access: **Anyone** (สำคัญมาก! ถ้าเลือก "Anyone with Google account" แอปจะเรียกไม่ได้)
7. คัดลอก **Web App URL** ที่ได้

8. เปิดไฟล์ `www/index.html` หาบรรทัด:
   ```javascript
   const WEB_APP_URL = "https://script.google.com/macros/s/.../exec";
   ```
   แก้เป็น URL ใหม่ของคุณ

---

## ขั้นตอนที่ 2: ติดตั้ง Dependencies

เปิด Terminal ที่โฟลเดอร์ `SurveyApp/`:

```bash
cd path/to/SurveyApp
npm install
```

ขั้นตอนนี้จะติดตั้ง Capacitor และ plugins ทั้งหมด ใช้เวลา 1-3 นาที

---

## ขั้นตอนที่ 3: เพิ่ม Native Platforms

```bash
# Initialize Capacitor (ครั้งแรกเท่านั้น)
npx cap init "Survey App" com.survey.fieldapp --web-dir=www
# ตอบ Yes ทุกข้อ หรือกด Enter ผ่าน

# เพิ่ม Android
npx cap add android

# เพิ่ม iOS (ต้องอยู่บน Mac เท่านั้น)
npx cap add ios
```

จะมีโฟลเดอร์ `android/` และ `ios/` เกิดขึ้น

---

## ขั้นตอนที่ 4: ตั้งค่า Permissions

### 4.1 Android - แก้ไข `android/app/src/main/AndroidManifest.xml`

เปิดไฟล์ และเพิ่ม permissions ใน `<manifest>` (นอก `<application>`):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
    android:maxSdkVersion="32" />

<uses-feature android:name="android.hardware.location.gps" android:required="false" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

### 4.2 iOS - แก้ไข `ios/App/App/Info.plist`

เปิดไฟล์ และเพิ่มใน `<dict>`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>แอปต้องการตำแหน่ง GPS เพื่อสำรวจภาคสนาม</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>แอปต้องการตำแหน่ง GPS เพื่อสำรวจภาคสนาม</string>

<key>NSCameraUsageDescription</key>
<string>แอปต้องการกล้องเพื่อถ่ายภาพประกอบการสำรวจ</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>แอปต้องการเข้าถึงคลังภาพเพื่อแนบรูปประกอบการสำรวจ</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>แอปต้องการบันทึกรูปภาพลงคลังภาพ</string>
```

---

## ขั้นตอนที่ 5: Sync และ Build

```bash
# Sync code เข้าไปใน native projects
npx cap sync
```

### 5.1 Build Android (ได้ไฟล์ .apk)

#### วิธีที่ 1: ใช้ Android Studio (แนะนำสำหรับครั้งแรก)
```bash
npx cap open android
```
จะเปิด Android Studio ขึ้นมา

ใน Android Studio:
1. รอให้ Gradle sync เสร็จ (อาจใช้เวลา 5-10 นาทีครั้งแรก)
2. ต่อมือถือ Android เข้ากับ Mac (เปิด USB Debugging)
   - ตั้งค่า → เกี่ยวกับโทรศัพท์ → แตะ Build number 7 ครั้ง
   - กลับมา ตั้งค่า → ตัวเลือกนักพัฒนา → เปิด USB debugging
3. กดปุ่ม **▶ Run** (สามเหลี่ยมเขียว) เลือกอุปกรณ์ที่ต่ออยู่
4. แอปจะติดตั้งและเปิดบนมือถือ

#### วิธีที่ 2: Build .apk ผ่าน command line
```bash
cd android
./gradlew assembleDebug
```
ไฟล์ `.apk` อยู่ที่: `android/app/build/outputs/apk/debug/app-debug.apk`

ส่งไฟล์นี้ให้ใครก็ติดตั้งได้เลย (ต้องเปิด "Install from unknown sources" บนมือถือ)

#### วิธีที่ 3: Build แบบ Release (สำหรับ Google Play Store)
ต้องสร้าง keystore ก่อน:
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias survey-app
```

แล้วใน `android/app/build.gradle` เพิ่ม signing config (ดูเอกสาร Capacitor)

```bash
cd android
./gradlew assembleRelease
```

### 5.2 Build iOS (ได้ไฟล์ .ipa)

```bash
npx cap open ios
```
จะเปิด Xcode

ใน Xcode:
1. คลิกที่ project name (มุมบนซ้าย) → tab **Signing & Capabilities**
2. **Team**: เลือก Apple ID ของคุณ (ถ้ายังไม่มี → Add Account)
3. **Bundle Identifier**: เปลี่ยนเป็นชื่อที่ไม่ซ้ำ เช่น `com.yourname.surveyapp`
4. ต่อ iPhone เข้ากับ Mac (สาย Lightning/USB-C)
   - บน iPhone: ตั้งค่า → ความเป็นส่วนตัวและความปลอดภัย → โหมดนักพัฒนา → เปิด
5. เลือก device จาก dropdown ด้านบน
6. กด **▶ (Build & Run)**

#### Build .ipa สำหรับแจกจ่าย
ต้องสมัคร **Apple Developer Program** ($99/ปี) ก่อน
1. Xcode → Product → Archive
2. รอ build เสร็จ → Distribute App → Ad Hoc / App Store
3. จะได้ไฟล์ `.ipa`

> หมายเหตุ: หาก**ไม่มี Apple Developer account** ($99/ปี) จะ build ลงเครื่องตัวเองได้แต่ใช้ได้แค่ 7 วัน แล้วต้อง re-install ใหม่

---

## ขั้นตอนที่ 6: ทุกครั้งที่แก้โค้ด

หลังจากแก้ไฟล์ใน `www/` ต้อง sync ใหม่เสมอ:
```bash
npx cap sync
```
แล้วกด Run ใน Xcode/Android Studio อีกครั้ง

---

## ปัญหาที่พบบ่อย

### ❌ Android: `SDK location not found`
สร้างไฟล์ `android/local.properties`:
```
sdk.dir=/Users/yourname/Library/Android/sdk
```

### ❌ iOS: `pod install failed` 
```bash
cd ios/App
pod repo update
pod install
```

### ❌ แอปเปิดแล้วจอขาว / Apps Script ไม่ตอบ
- ตรวจสอบว่า `WEB_APP_URL` ใน `www/index.html` ถูกต้อง
- ตรวจสอบว่า Apps Script deploy เป็น "Anyone" access
- ลอง `npx cap sync` ใหม่
- ดู error ผ่าน Chrome DevTools (Android) หรือ Safari Web Inspector (iOS):
  - **Android**: เปิด Chrome → `chrome://inspect` → เลือก device
  - **iOS**: Safari → Develop menu → device name → app

### ❌ GPS ไม่ทำงาน
- ตรวจสอบว่าเพิ่ม permissions ใน Manifest/Info.plist แล้ว
- ลอง uninstall แอป แล้วติดตั้งใหม่ (เพื่อให้ขอสิทธิ์อีกครั้ง)
- ออกไปทดสอบที่กลางแจ้ง (GPS ไม่จับสัญญาณในตึก)

### ❌ CORS error ตอนเรียก Apps Script
- ตรวจสอบว่าใช้โค้ด `code.gs` เวอร์ชันใหม่ที่ผมให้
- Re-deploy Apps Script เป็น **New version**
- เปลี่ยน URL ใน HTML

### ❌ ถ่ายรูปแล้วไม่บันทึกลง Drive
- ตรวจสอบว่า Apps Script มีสิทธิ์ Drive (รัน `saveData` ใน editor 1 ครั้งเพื่อ authorize)
- ตรวจสอบ quota Google Drive

### ❌ iOS: WebView blocks geolocation
- ตรวจสอบ `capacitor.config.json` ว่า `iosScheme: "https"` (ไม่ใช่ `capacitor`)

---

## คำสั่งสรุปเพื่อ Build เร็ว

```bash
# Android (เร็วสุด)
npx cap sync android && npx cap run android

# iOS
npx cap sync ios && npx cap run ios

# เปิดใน IDE ปกติ
npx cap open android
npx cap open ios
```

---

## ขั้นถัดไป (ถ้าสนใจ)

- 🎨 เปลี่ยน app icon: ใช้ https://capacitorjs.com/docs/guides/splash-screens-and-icons
- 📦 อัปโหลด Play Store: ต้องมีบัญชี Google Play Console ($25 ครั้งเดียว)
- 🍎 อัปโหลด App Store: ต้องมี Apple Developer ($99/ปี) + ใช้ App Store Connect
- 🌐 Offline mode: ใช้ IndexedDB เก็บข้อมูลก่อน sync เมื่อมี internet
- 🗺️ Offline tiles: ใช้ leaflet.offline plugin
