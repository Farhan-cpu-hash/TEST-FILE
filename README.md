# VitalLink - OnePlus Health Demo

This system demonstrates a Wearable -> SOS workflow.

## 🚀 Quick Start
1. **Double-click** `start_server.bat` to run.
2. Open the links below.

## 🔗 Links (Routes)
1. **User Page** (Input & Analysis):  
   [http://localhost:3000/user.html](http://localhost:3000/user.html)
   - Use this to simulate wearable data or upload screenshots.
   - Triggers SOS if vitals are invalid.

2. **Admin Page** (Central Dashboard):  
   [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
   - **Password**: `123`
   - View received SOS alerts.
   - Manage Patient Risk Levels (1, 2, 3).

## 🧪 How to Test
1. **Healthy Case**:
   - Go to `/user.html`.
   - Click "Fetch Data" then "Analyze".
   - Result: Green "User is OK".
   - Go to `/admin.html` -> No new critical alert (unless history exists).

2. **SOS Case**:
   - Go to `/user.html`.
   - Click "Upload OHealth" (Simulates high HP/Temp).
   - Click "Analyze".
   - Result: **RED SOS UI**.
   - Go to `/admin.html` (Refresh table).
   - Result: New Red Row showing "High Heart Rate..." and "WA Sent".

## Configuration
- **Simulation**: Messaging is simulated in `server/server.js`. Check the console logs for "Sent WhatsApp..." output.
- **Database**: Stored in `server/database.sqlite`. Delete this file to reset data.
