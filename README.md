# 🐾 PetPaws Veterinary Hospital Management System

[![Status](https://img.shields.io/badge/Status-Under%20Development-orange.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React-blue.svg)](#)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](#)
[![MySQL](https://img.shields.io/badge/Database-MySQL-lightblue.svg)](#)

PetPaws is a modern, web-based veterinary hospital management system designed to streamline and automate clinic operations. From appointment scheduling to inventory tracking, PetPaws provides a comprehensive solution for clinics, veterinarians, and pet owners alike.

---

## 📸 Gallery

*Add your application screenshots here to showcase your beautiful UI!*

| Login Page | Patient Dashboard | Appointment Booking |
| :---: | :---: | :---: |
| ![Login Placeholder](https://via.placeholder.com/300x200?text=Login+Page) | ![Dashboard Placeholder](https://via.placeholder.com/300x200?text=Dashboard) | ![Booking Placeholder](https://via.placeholder.com/300x200?text=Booking) |

---

## ✨ Key Features

### 🔐 Security & Access
*   **JWT-based Authentication**: Secure user sessions.
*   **Role-Based Access Control (RBAC)**: Custom dashboards for Admins, Vets, Receptionists, and Clients.

### 🐕 Patient Management
*   **Pet Profiles**: Comprehensive medical history and allergy tracking.
*   **Medical Records**: Digital prescriptions and diagnostic logs.

### 🏥 Clinic Operations
*   **Online Booking**: Seamless appointment scheduling for clients.
*   **Real-time Queue**: Live tracking of clinic appointments.
*   **Inventory Tracking**: Automatic alerts for low stock on medicines and supplies.

### 💳 Finance & Feedback
*   **Payment Integration**: Invoice management (PayHere supported).
*   **Loyalty System**: Reward repeat clients and gather feedback.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Tooling**: Axios, JSON Web Token (JWT), Nodemailer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Sewmini-Bhagya/petpaws-management-system.git
cd petpaws-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your configurations:
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=petpaws_db
DB_PORT=3306
PORT=8000
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PAYHERE_MERCHANT_ID=your_id
PAYHERE_MERCHANT_SECRET=your_secret
```

### 3. Database Setup
1. Open your MySQL client.
2. Create the database:
   ```sql
   CREATE DATABASE petpaws_db;
   ```
3. *(Optional)* Import the provided SQL schema if available.

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
petpaws/
├── backend/            # Express.js Server
│   ├── src/
│   │   ├── config/     # Database & App Config
│   │   ├── controllers/# Route Handlers
│   │   ├── models/     # Database Queries
│   │   └── routes/     # API Endpoints
├── frontend/           # React App (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # View Components
│   │   └── data/       # Static Data & Constants
└── LICENSE             # MIT License
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact
Project Link: [https://github.com/Sewmini-Bhagya/petpaws-management-system](https://github.com/Sewmini-Bhagya/petpaws-management-system)

*Built with ❤️ for better pet care.*
