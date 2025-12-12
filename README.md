# VitalLink - OnePlus Health Demo

This is a prototype SOS Alert System.

## Prerequisites
1. **Node.js**: You MUST have Node.js installed to run the backend. [Download Here](https://nodejs.org/).

## Setup Instructions
1. Open a terminal in this folder: `VitalLink_OnePlus_Demo`.
2. Install dependencies:
   ```bash
   npm install
   ```
   *(If this command fails, please ensure Node.js is installed and added to your PATH).*

3. Start the Backend Server:
   ```bash
   node server/server.js
   ```
   You should see: `Connected to SQLite database.` and `Server running on http://localhost:3000`.

4. Open the Website:
   - Go to your browser.
   - Type: `http://localhost:3000/index.html`

## How to Test

### 1. Test "User OK" (Healthy)
- Click **"Fetch from Band"** (This simulates reading normal ranges).
- Click **"Analyze Vitals"**.
- Result: GREEN "User is OK".

### 2. Test "SOS Alert" (Emergency)
- Click **"Upload Image"** on "Option B" card.
- Select any random image (Simulation triggers).
- Notice values are filled with **Abnormal High/Low** data.
- Click **"Analyze Vitals"**.
- Result: RED "SOS GENERATED".
- Check the Server Console to see the log of "Simulated WhatsApp/SMS Sent".

### 3. Emergency Contacts
- Go to "Emergency Contacts" page.
- Edit the numbers to see persistence in the database.
