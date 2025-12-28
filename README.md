
# 📱 Expense Tracker (Offline-First Android App)

An **offline-first expense tracking mobile application** built using **Expo + React Native**, designed to help users track income and expenses, manage categories, and visualize spending patterns through charts — all without requiring an internet connection.

This app is fully functional as a **standalone Android APK** and is optimized for real-world usage.

---

## 🚀 Features

### ✅ Core Functionality
- Add **income and expense** transactions
- Fully **offline data storage**
- Persistent data even after app restart
- Edit existing transactions
- Delete transactions with confirmation

### 🗂️ Category Management
- Separate categories for **Income** and **Expense**
- Add new custom categories
- Delete categories safely
- Categories dynamically update across the app

### 📊 Analytics & Visualizations
- **Weekly / Monthly / Yearly** filters
- Expense by category (Pie Chart)
- Income by category (Pie Chart)
- Income vs Expense comparison (Bar Chart)
- Spending / Income trend over time (Line Chart)
- Toggle between **Expense / Income** trends
- Dynamic color-coded charts

### 🎨 User Experience
- Clean, modern UI
- Welcome screen with date context
- Empty-state UX
- Long-press gestures for deletion
- Adaptive Android app icon
- Immersive full-screen experience
- Auto-hiding Android navigation bar

### 📦 Deployment Ready
- Packaged as **Android APK** using Expo EAS
- No Expo Go required for end users
- Ready for Play Store submission

---

## 🧱 Tech Stack

- **React Native**
- **Expo**
- **Expo Router**
- **AsyncStorage**
- **react-native-chart-kit**
- **react-native-svg**
- **Expo EAS Build**

---

## ▶️ Running the App

```bash
npm install
expo start
```

---

## 📦 Build APK

```bash
npm install -g eas-cli
expo login
eas init
eas build -p android --profile preview
```

---

## 📜 License

MIT License
