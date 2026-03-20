# 📱 How to Test API from Android Emulator - Step by Step Guide

## ✅ Method 1: Using Browser in Android Emulator (EASIEST!)

### Steps:
1. **Start your Android Emulator** in Android Studio
   - Open Android Studio
   - Click "Device Manager" (phone icon on right side)
   - Click the ▶️ play button next to any emulator
   - Wait for the emulator to fully boot

2. **Open Chrome/Browser in the emulator**
   - Click the Chrome app in the emulator

3. **Type this URL in the browser:**
   ```
   http://10.0.2.2:3000
   ```
   
4. **You should see:**
   ```json
   {"message": "Welcome to Habit Tracker API"}
   ```

5. **Test with the HTML tester:**
   - In the emulator browser, type:
   ```
   http://10.0.2.2:3000/test-emulator.html
   ```
   - Click the test buttons to verify API connectivity

---

## ✅ Method 2: Using Postman/API Testing

### Option A: In your PC (localhost)
- URL: `http://localhost:3000/api/auth/login`
- Method: POST
- Body (JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```

### Option B: From Emulator (using 10.0.2.2)
- Same as above but use: `http://10.0.2.2:3000/api/auth/login`

---

## 🔧 Troubleshooting

### If `http://10.0.2.2:3000` doesn't work:

1. **Make sure your backend is running on 0.0.0.0:**
   - Check your terminal, you should see:
     ```
     ✓ Server is running on port 3000
       - Local:            http://localhost:3000
       - Network:          http://<your-ip>:3000
       - Android Emulator: http://10.0.2.2:3000
     ```

2. **Restart the Android Emulator:**
   - Sometimes the emulator needs a fresh start

3. **Check server logs:**
   - When you test from emulator, you should see requests in your backend terminal

---

## 📍 Network Access (For Physical Devices Only)

Your PC's IP: **192.168.1.4**

To access from a **physical Android device** on the same WiFi:

1. **Add Windows Firewall Rule** (Run PowerShell as Administrator):
   ```powershell
   netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
   ```

2. **Use this URL in your phone:**
   ```
   http://192.168.1.4:3000
   ```

⚠️ **Note:** For Android development, you DON'T need network access! The emulator uses `10.0.2.2` which already works.

---

## 🎯 For Your Android App (Kotlin/Retrofit)

```kotlin
object ApiConfig {
    // For Emulator
    private const val BASE_URL = "http://10.0.2.2:3000/api/"
    
    // For Physical Device on same WiFi
    // private const val BASE_URL = "http://192.168.1.4:3000/api/"
    
    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}
```

---

## ✨ Quick Test Commands

Test from your PC terminal (should work immediately):
```bash
# Test root
curl http://localhost:3000

# Test login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```
