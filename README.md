# 🏠 InmoSanvi - Pro Real Estate Fullstack Dashboard

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

**InmoSanvi** is a comprehensive real estate management platform that combines a modern frontend architecture with a robust NestJS backend. The system delivers a fluid, reactive, and secure user experience, optimized through Server-Side Rendering (SSR).

---

## 🎯 Project Purpose & Architecture

This project was designed to demonstrate the integration of complex data flows and advanced security within enterprise-grade applications:

* **Hybrid Auth System**: Robust authentication implementation featuring local accounts and OAuth (Google & Facebook) integration.
* **Performance First**: Built with **Standalone Components** to minimize boilerplate and increase flexibility, alongside **Server-Side Rendering (SSR)** to optimize SEO and initial load times.
* **Scalable Backend**: A modular NestJS architecture managing data persistence, business logic, and secure authentication.

## ✨ Key Features

* **🛡️ Advanced Security**: Custom Angular Interceptors that automatically handle JWT token injection and validate authentication states for route protection.
* **📍 Geo-Location Services**: Map integration allowing real-time property localization during listing and leveraging user location for "nearby" searches.
* **📊 Interactive Tools**: 
    * Built-in mortgage calculator.
    * Dynamic rating system (stars) and user comments.
* **👤 User Profile Management**: Comprehensive dashboard for users to manage their listings, edit personal information, and update profile pictures.
* **🔍 Reactive Filtering**: A high-performance search engine powered by **RxJS**, allowing users to filter properties instantly across multiple criteria without page reloads.

## 🛠️ Technical Stack

### Frontend (Angular)
- **Architecture**: Standalone Components & Functional Guards.
- **Rendering**: Angular SSR (Server-Side Rendering).
- **State Management**: Reactive programming with **RxJS** (Observables & Subjects).
- **Styling**: Bootstrap/Tailwind with a fully responsive design.
- **Testing**: Vitest for unit testing.

### Backend (NestJS API)
- **Auth**: Passport.js (JWT, Google & Facebook strategies).
- **Communication**: Custom interceptors for header management and global error handling.

---

## 🚀 Getting Started

```bash
git clone https://github.com/Israelamat/angular-inmosanvi.git
npm install
ng serve
```
---

## 📸 Screenshots

Below are some key views of the platform showcasing the UI/UX and main features.

### 🏠 Main Dashboard
[![Angular-Imno-Sanvi.jpg](https://i.postimg.cc/Mp1szrW5/Angular-Imno-Sanvi.jpg)](https://postimg.cc/MnK0D5ff)

### 🏡 Property Detail Page
[![Angular-Imno-Sanvi2.jpg](https://i.postimg.cc/9FjzFJPj/Angular-Imno-Sanvi2.jpg)](https://postimg.cc/ThCTtjHk)
