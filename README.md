# Food Reuse Web Application Settings

This project is built using:
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL (XAMPP)

## Setup Instructions

### 1. Database Setup
1. Open XAMPP Control Panel and start **Apache** and **MySQL**.
2. Open phpMyAdmin in your browser (usually `http://localhost/phpmyadmin`).
3. Import the `database.sql` file located in the root directory. This will create the `food_reuse_db` database and necessary tables.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Node.js server:
   ```bash
   node server.js
   ```
   The backend should now be running on `http://localhost:5000`.

### 3. Frontend Setup
1. You can simply open the `frontend/index.html` file in your browser, or use a tool like "Live Server" in VS Code to run it locally.
2. The UI will communicate with your local backend API automatically.

### Features
- JWT Authentication (Register/Login).
- Donors can post food and track status.
- Receivers can see available food and request it.
- **Innovative Feature:** Expiry Tracking - Real-time checking of expiry time on fetching available food. If `expiry_time` has passed, the status automatically switches to 'expired'.
