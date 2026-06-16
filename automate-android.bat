@echo off
echo 📱 Starting Tagmi Android Automation (Flutter)...

:: 1. Ensure the laptop can see the phone
echo 🔍 Checking for connected devices...
adb devices

:: 2. Setup port forwarding for the NestJS API (Port 3000)
:: This allows the mobile app to use 'http://localhost:3000' to reach your backend
echo 🔗 Mapping API port (3000) to device...
adb reverse tcp:3000 tcp:3000

:: 3. Navigate to Flutter project
cd /d "%~dp0tagmi_app"

:: 4. Verify pubspec.yaml exists before running
if not exist "pubspec.yaml" (
    echo ❌ Error: pubspec.yaml not found in %cd%
    echo Please move this script to your Flutter project root or edit the script to 'cd' there.
    pause
    exit /b
)

echo 🚀 Running Flutter app on connected device...
flutter run