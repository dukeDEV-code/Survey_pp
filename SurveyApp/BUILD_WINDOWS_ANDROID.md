# คู่มือ Build แอป Android บน Windows 11

คู่มือนี้สำหรับคนใช้ Windows ที่ต้องการ build เฉพาะ Android (.apk)
เวลารวมประมาณ: ติดตั้งครั้งแรก ~1-2 ชั่วโมง, build รอบต่อไป ~5 นาที

---

## ขั้นที่ 0: ติดตั้งเครื่องมือบน Windows 11

ต้องติดตั้ง 3 ตัว: **Node.js**, **JDK 17**, **Android Studio**

### 0.1 Node.js
1. ไปที่ https://nodejs.org/
2. ดาวน์โหลด **LTS version** (.msi installer)
3. ติดตั้งแบบ Next-Next-Finish (เปิด "Automatically install necessary tools" ด้วย)
4. **ปิดและเปิด PowerShell ใหม่** แล้วเช็ค:
   ```powershell
   node --version
   npm --version
   ```
   ควรเห็นเลขเวอร์ชัน เช่น `v20.x.x`

### 0.2 Java JDK 17
Android Gradle ต้องการ JDK 17 (ไม่ใช่ 21 ไม่ใช่ 8)

1. ไปที่ https://learn.microsoft.com/en-us/java/openjdk/download
2. ดาวน์โหลด **Microsoft Build of OpenJDK 17** (ไฟล์ `.msi` สำหรับ x64)
3. ติดตั้ง — ตอนติดตั้งให้ติ๊ก **"Set JAVA_HOME variable"** และ **"Add to PATH"**
4. ปิดเปิด PowerShell ใหม่ แล้วเช็ค:
   ```powershell
   java -version
   ```
   ควรเห็น `openjdk version "17.x.x"`

### 0.3 Android Studio
1. ไปที่ https://developer.android.com/studio → Download
2. ติดตั้ง (ไฟล์ใหญ่ ~1 GB ต้องใช้ internet ดี)
3. เปิด Android Studio ครั้งแรก → ตามคำแนะนำของ Setup Wizard:
   - เลือก **Standard** installation
   - กด Next ไปเรื่อยๆ ให้ดาวน์โหลด Android SDK (ใช้เวลา 10-20 นาที, ขนาด ~3-5 GB)
4. หลังติดตั้งเสร็จ จด **path ของ Android SDK** ไว้:
   - ปกติจะอยู่ที่ `C:\Users\<your-name>\AppData\Local\Android\Sdk`
   - ดูได้ใน Android Studio → **More Actions** → **SDK Manager** → ด้านบนจะมี **Android SDK Location**

### 0.4 ตั้ง Environment Variables (สำคัญมาก!)

1. กด **Windows key** → พิมพ์ `environment variables` → เลือก **"Edit the system environment variables"**
2. ในหน้าต่างที่เปิดมา กดปุ่ม **Environment Variables...**
3. ในกรอบ **User variables** กด **New...** เพิ่ม 2 ตัว:

   | ชื่อ | ค่า (ตัวอย่าง) |
   |---|---|
   | `ANDROID_HOME` | `C:\Users\YourName\AppData\Local\Android\Sdk` |
   | `JAVA_HOME` | `C:\Program Files\Microsoft\jdk-17.0.x.x-hotspot` (ถ้ายังไม่มี) |

   *(เปลี่ยน `YourName` เป็นชื่อ user ของเครื่องคุณ)*

4. หา **Path** ในกรอบ User variables → กด **Edit...** → กด **New** → เพิ่มทีละบรรทัด:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\cmdline-tools\latest\bin
   ```

5. กด OK ทุกหน้าต่างเพื่อบันทึก

6. **ปิด PowerShell ทั้งหมด แล้วเปิดใหม่** (env variables จะมีผลเฉพาะ terminal ที่เปิดหลังจากนี้)

7. ทดสอบ:
   ```powershell
   echo $env:ANDROID_HOME
   echo $env:JAVA_HOME
   adb --version
   ```
   ถ้าทุกตัวขึ้น = OK พร้อมใช้

---

## ขั้นที่ 1: เตรียมโปรเจค

### 1.1 แตกไฟล์ zip
1. แตก `SurveyApp.zip` ไว้ที่ที่จำง่าย เช่น `C:\Projects\SurveyApp`
   *(อย่าวางในโฟลเดอร์ OneDrive หรือ Desktop ที่ sync — มีโอกาสติดปัญหา file lock)*

### 1.2 แก้ URL Apps Script
1. เปิด `C:\Projects\SurveyApp\www\index.html` ด้วย VS Code หรือ Notepad
2. หาบรรทัด:
   ```javascript
   const WEB_APP_URL = "https://script.google.com/macros/s/AKfyc.../exec";
   ```
3. ตรวจสอบว่าเป็น URL ของ Apps Script ที่คุณ deploy แล้ว (deploy ใหม่ตามคู่มือก่อนหน้า ถ้ายังไม่ได้ทำ)

### 1.3 ติดตั้ง dependencies
เปิด **PowerShell** (หรือ Windows Terminal) ที่โฟลเดอร์โปรเจค:

วิธีเปิดเร็ว: เปิด File Explorer → คลิกขวาในโฟลเดอร์ `SurveyApp` ขณะกด Shift → เลือก **"Open PowerShell window here"** หรือ **"Open in Terminal"**

แล้วรัน:
```powershell
npm install
```
รอ 1-3 นาที จะมีโฟลเดอร์ `node_modules/` เกิดขึ้น

---

## ขั้นที่ 2: เพิ่ม Android Platform

```powershell
npx cap add android
```

จะมีโฟลเดอร์ `android/` เกิดขึ้น (ใหญ่ประมาณ 100-300 MB)

ถ้าเจอ error เกี่ยวกับ "Capacitor not initialized" ให้รัน:
```powershell
npx cap init "Survey App" com.survey.fieldapp --web-dir=www
```
แล้วลอง `npx cap add android` ใหม่

---

## ขั้นที่ 3: เพิ่ม Permissions ใน AndroidManifest.xml

นี่คือขั้นที่สำคัญที่สุด ถ้าไม่ทำ GPS และกล้องจะใช้ไม่ได้

1. เปิดไฟล์: `android\app\src\main\AndroidManifest.xml`
2. หาบรรทัด `<manifest ...>` (ตอนต้นไฟล์)
3. หาบรรทัด `<application ...>` 
4. ระหว่าง `</application>` ปิด กับ `</manifest>` ปิด — เพิ่มบล็อกนี้เข้าไป:

```xml
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" 
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
        android:maxSdkVersion="32" />

    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
```

5. **Save**

---

## ขั้นที่ 4: Sync โค้ดเข้า Android Project

```powershell
npx cap sync android
```

คำสั่งนี้จะคัดลอกไฟล์ใน `www/` เข้าไปใน `android/app/src/main/assets/` พร้อมอัปเดต plugins ทั้งหมด

**สำคัญ**: ทุกครั้งที่แก้ไฟล์ใน `www/` ต้องรันคำสั่งนี้ก่อน build ใหม่

---

## ขั้นที่ 5: Build APK

มี 2 วิธี

### วิธีที่ 1: ใช้ Android Studio (แนะนำสำหรับครั้งแรก)

```powershell
npx cap open android
```
จะเปิด Android Studio ขึ้นมาพร้อมกับโปรเจค

ใน Android Studio:
1. **รอ Gradle sync เสร็จ** — ดูที่แถบล่างของหน้าต่าง จะมี progress bar (ใช้เวลา 5-10 นาทีครั้งแรก เพราะดาวน์โหลด dependencies)
2. ถ้ามี popup แจ้ง "Update Gradle" → กด **Don't ask for this project**
3. ถ้ามี popup "SDK not found" → คลิกลิงก์ที่ Android Studio แนะนำเพื่อ install SDK ที่ขาด

#### Build แบบ Debug (.apk สำหรับทดลองใช้)
1. ที่เมนูบน → **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. รอประมาณ 1-3 นาที
3. มี notification เด้งขึ้นมา → คลิก **locate** เพื่อเปิดโฟลเดอร์ที่มีไฟล์ .apk
4. ไฟล์อยู่ที่: `android\app\build\outputs\apk\debug\app-debug.apk`

ส่งไฟล์ `app-debug.apk` นี้ให้ใครก็ได้ ติดตั้งบนมือถือ Android ได้เลย

#### Run บนมือถือจริงผ่าน USB (ถ้าอยากทดสอบเลย)
1. บนมือถือ Android: ตั้งค่า → **เกี่ยวกับโทรศัพท์** → แตะ **หมายเลขเวอร์ชัน** (Build number) **7 ครั้งติดกัน**
2. กลับมาที่ ตั้งค่า → จะเห็นเมนู **ตัวเลือกนักพัฒนา** (Developer options) เพิ่มขึ้นมา
3. เปิด **USB debugging**
4. ต่อมือถือกับคอม PC ผ่านสาย USB
5. มือถือจะมี popup ถาม "Allow USB debugging?" → กด Allow
6. ใน Android Studio ดูที่ dropdown ด้านบน — ควรเห็นชื่อมือถือคุณ
7. กดปุ่ม **▶ Run** (ลูกศรเขียว)
8. แอปจะติดตั้งและเปิดขึ้นมาบนมือถือเลย

### วิธีที่ 2: Build จาก Command Line (ไม่ต้องเปิด Android Studio)

```powershell
cd android
.\gradlew assembleDebug
```
*(ใช้ `.\gradlew` ไม่ใช่ `./gradlew` บน PowerShell)*

ครั้งแรกใช้เวลานาน 5-15 นาที (ดาวน์โหลด Gradle และ dependencies) ครั้งต่อๆ ไปเร็วมาก ~30 วินาที

ไฟล์ APK จะอยู่ที่: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## ขั้นที่ 6: ติดตั้ง APK บนมือถือ Android

มี 3 วิธี

### วิธีที่ 1: ส่งไฟล์เข้ามือถือ
- ส่งผ่าน Line/Email ตัวเอง / Google Drive / Telegram
- เปิดไฟล์ในมือถือ → กดติดตั้ง
- ครั้งแรกอาจถาม "Allow install from this source" → กด Allow

### วิธีที่ 2: ผ่าน USB cable (ใช้ adb)
```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### วิธีที่ 3: ใช้ Android Studio Run โดยตรง (ตามขั้นตอนก่อนหน้า)

---

## ขั้นที่ 7: Build แบบ Release (สำหรับแจกจ่ายจริงจัง)

ถ้าจะอัปโหลด Play Store หรือต้องการ APK ที่มี optimize แล้ว ต้อง sign ด้วย keystore

### 7.1 สร้าง keystore (ครั้งเดียว — เก็บไฟล์นี้ให้ดี!)
```powershell
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias survey-app
```
จะถาม password และข้อมูลเล็กน้อย — จดไว้

> ⚠️ **เก็บไฟล์ .jks และ password ให้ดี**: ถ้าหายจะอัปเดตแอปบน Play Store ไม่ได้อีกเลย

### 7.2 ตั้งค่า signing
แก้ไฟล์ `android\app\build.gradle` หาบล็อก `android { ... }` แล้วเพิ่ม:

```gradle
android {
    // ...
    signingConfigs {
        release {
            storeFile file('../../my-release-key.jks')
            storePassword 'your_password'
            keyAlias 'survey-app'
            keyPassword 'your_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

### 7.3 Build release
```powershell
cd android
.\gradlew assembleRelease
```
ไฟล์อยู่ที่: `android\app\build\outputs\apk\release\app-release.apk`

---

## คำสั่งสรุปสำหรับการแก้-build ครั้งต่อไป

```powershell
# หลังแก้ www/index.html ทำ 2 คำสั่งนี้:
npx cap sync android
cd android
.\gradlew assembleDebug

# หรือถ้าต่อมือถือผ่าน USB อยู่:
.\gradlew installDebug
```

---

## ปัญหาที่พบบ่อย & วิธีแก้

### ❌ `'npx' is not recognized`
- ปิดเปิด PowerShell ใหม่ (Node.js เพิ่งติดตั้ง path ยังไม่อัปเดต)

### ❌ `'adb' is not recognized`
- Environment variable `ANDROID_HOME` ตั้งไม่ถูก หรือยังไม่ได้เพิ่ม `%ANDROID_HOME%\platform-tools` ใน PATH
- ปิด-เปิด terminal ใหม่หลังตั้ง env

### ❌ Gradle build error: `SDK location not found`
สร้างไฟล์ `android\local.properties` (ถ้ายังไม่มี) ใส่:
```
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```
*(สังเกต `\\` ต้องเป็น double backslash)*

### ❌ Gradle error: `Unsupported Java version` หรือ `Unsupported class file major version XX`
- Java เวอร์ชันไม่ถูก ต้องใช้ JDK 17 ไม่ใช่ 21 หรือ 8
- เช็ค: `java -version`
- เปลี่ยน JAVA_HOME ใน env variable ให้ชี้ไป JDK 17

### ❌ Gradle ค้างที่ "Downloading https://services.gradle.org/..."
- เน็ตช้า/บล็อก ลองใช้ VPN หรือเปลี่ยน DNS เป็น 1.1.1.1
- รอเฉยๆ ก็ได้ (อาจใช้เวลาเกิน 10 นาที)

### ❌ แอปเปิดแล้วจอขาว
- ตรวจสอบว่า `WEB_APP_URL` ใน `www/index.html` ถูกต้อง
- ตรวจสอบว่า Apps Script deploy แบบ "Anyone" access
- ดู console error: ต่อมือถือกับ PC → เปิด Chrome → พิมพ์ `chrome://inspect` → จะเห็น webview ของแอป → คลิก inspect → ดู Console tab

### ❌ GPS ไม่ทำงาน / กล้องไม่ขึ้น
- ตรวจสอบว่าเพิ่ม permissions ใน `AndroidManifest.xml` ครบ (ขั้นที่ 3)
- ลอง uninstall แอปออก แล้วติดตั้งใหม่ (เพื่อให้ขอสิทธิ์ใหม่)
- ดูในมือถือ: ตั้งค่า → แอปพลิเคชัน → Survey App → สิทธิ์ → ตรวจดูว่าเปิด Location และ Camera

### ❌ "App not installed" ตอนติดตั้ง APK
- ถ้าเคยติดตั้งแอปนี้ด้วยลายเซ็นอื่น ให้ uninstall เวอร์ชันเดิมก่อน
- ตรวจสอบว่ามือถือเปิด "Install from unknown sources" สำหรับแอปที่ใช้เปิดไฟล์

### ❌ ติด CORS error ตอนเรียก Apps Script
- ตรวจสอบว่าใช้โค้ด `code.gs` เวอร์ชันใหม่ที่ผมให้ (ที่มี `doPost`)
- กลับไปที่ Apps Script editor → Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy
- ตรวจสอบว่า Who has access = **Anyone** (ไม่ใช่ "Anyone with Google account")

---

## ทดสอบเร็วๆ ก่อน build (Optional)

หากแค่อยาก preview UI ในเบราว์เซอร์ก่อน:
```powershell
cd www
python -m http.server 8080
```
*(ต้องมี Python ติดตั้งอยู่ — ถ้าไม่มีให้ใช้ http-server แทน: `npx http-server www -p 8080`)*

เปิด `http://localhost:8080` ในเบราว์เซอร์ Chrome

แต่ GPS อาจไม่ทำงานบน `http://` แนะนำให้ build เป็น APK แล้วทดสอบบนมือถือเลย

---

## Note: ไม่สามารถ build iOS บน Windows ได้

Apple บังคับให้ build iOS apps ต้องใช้ Mac เท่านั้น ทางออก:
- ยืม Mac เพื่อน
- ใช้ Mac ใน cloud (เช่น MacinCloud, ~$30/เดือน)
- ใช้ GitHub Actions ที่มี macOS runner (ฟรีถ้าโปรเจค public)
- ใช้บริการ build เช่น Ionic Appflow, EAS Build (Expo)

ถ้าจำเป็นต้องการ iOS จริงๆ บอกผมได้ จะแนะนำวิธี cloud build ให้
