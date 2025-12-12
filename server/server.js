const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database Setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Contacts Table
        db.run(`CREATE TABLE IF NOT EXISTS emergency_contacts (
            id INTEGER PRIMARY KEY,
            name TEXT,
            phoneNumber TEXT,
            priority INTEGER
        )`);

        // Seed Contacts if empty
        db.get("SELECT count(*) as count FROM emergency_contacts", (err, row) => {
            if (row.count === 0) {
                const stmt = db.prepare("INSERT INTO emergency_contacts (id, name, phoneNumber, priority) VALUES (?, ?, ?, ?)");
                stmt.run(1, "Mom", "+1234567890", 1);
                stmt.run(2, "Dad", "+1987654321", 2);
                stmt.run(3, "Doctor", "+1122334455", 3);
                stmt.finalize();
                console.log("Seeded default contacts.");
            }
        });

        // Create Alerts Table
        db.run(`CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            heartRate REAL,
            spo2 REAL,
            temperature REAL,
            location TEXT,
            abnormalFields TEXT,
            reason TEXT,
            whatsappStatus TEXT,
            smsStatus TEXT
        )`);
    });
}

// --- LOGIC HELPERS ---

const NORMAL_RANGES = {
    hr: { min: 60, max: 100 },
    spo2: { min: 95, max: 100 },
    temp: { min: 36.5, max: 37.5 }
};

function analyzeVitals(hr, spo2, temp) {
    let abnormal = [];
    if (hr < NORMAL_RANGES.hr.min || hr > NORMAL_RANGES.hr.max) abnormal.push(`Heart Rate (${hr} bpm)`);
    if (spo2 < NORMAL_RANGES.spo2.min || spo2 > NORMAL_RANGES.spo2.max) abnormal.push(`SpO2 (${spo2}%)`);
    if (temp < NORMAL_RANGES.temp.min || temp > NORMAL_RANGES.temp.max) abnormal.push(`Temp (${temp}°C)`);
    return abnormal;
}

function simulateMessaging(contact, alertData) {
    // Simulate sending WhatsApp and SMS
    console.log(`[SIMULATION] Sending WhatsApp to Priority ${contact.priority} (${contact.name}: ${contact.phoneNumber})`);
    console.log(`[SIMULATION] Message: SOS! Abnormal Vitals detected at ${alertData.location}. Reasons: ${alertData.reason}`);
    
    console.log(`[SIMULATION] Sending SMS to Priority ${contact.priority} (${contact.name}: ${contact.phoneNumber})`);
    return true; // Success
}

// --- API ROUTES ---

// 1. Get Contacts
app.get('/api/contacts', (req, res) => {
    db.all("SELECT * FROM emergency_contacts ORDER BY priority ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Update Contact
app.post('/api/contacts', (req, res) => {
    const { id, name, phoneNumber } = req.body;
    db.run("UPDATE emergency_contacts SET name = ?, phoneNumber = ? WHERE id = ?", [name, phoneNumber, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Contact updated" });
    });
});

// 3. Analyze & Trigger SOS
app.post('/api/analyze', (req, res) => {
    const { heartRate, spo2, temperature, location } = req.body;
    
    // Parse as floats
    const hr = parseFloat(heartRate);
    const sp = parseFloat(spo2);
    const tm = parseFloat(temperature);

    const abnormalFields = analyzeVitals(hr, sp, tm);

    if (abnormalFields.length === 0) {
        // Healthy Case
        return res.json({
            status: "OK",
            sosGenerated: false,
            message: "User is OK. All vitals normal."
        });
    } else {
        // SOS Case
        const reason = "Abnormal value(s): " + abnormalFields.join(", ");
        
        // Fetch contacts to "Send" messages
        db.all("SELECT * FROM emergency_contacts ORDER BY priority ASC LIMIT 3", [], (err, contacts) => {
            if (err) console.error("Error fetching contacts for SOS");
            
            // Simulate sending to each
            let whatsappStatus = "Pending";
            let smsStatus = "Pending";
            
            if (contacts && contacts.length > 0) {
                contacts.forEach(c => simulateMessaging(c, { location, reason }));
                whatsappStatus = "Sent (Simulated)";
                smsStatus = "Sent (Simulated)";
            } else {
                whatsappStatus = "Failed (No Contacts)";
                smsStatus = "Failed (No Contacts)";
            }

            // Save Alert to DB
            const stmt = db.prepare(`INSERT INTO alerts (heartRate, spo2, temperature, location, abnormalFields, reason, whatsappStatus, smsStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            stmt.run(hr, sp, tm, location, JSON.stringify(abnormalFields), reason, whatsappStatus, smsStatus, function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                res.json({
                    status: "SOS",
                    sosGenerated: true,
                    message: "SOS Generated. Vitals Critical.",
                    details: {
                        abnormalFields,
                        sentTo: contacts.map(c => c.name),
                        whatsappStatus,
                        smsStatus
                    }
                });
            });
            stmt.finalize();
        });
    }
});

// 4. Mock Endpoint: Fetch form Band
app.get('/api/vitals/fetch-mock', (req, res) => {
    // Returns healthy data logic usually, can be randomized
    res.json({
        heartRate: Math.floor(Math.random() * (90 - 65) + 65), // 65-90
        spo2: Math.floor(Math.random() * (100 - 96) + 96),     // 96-100
        temperature: (Math.random() * (37.2 - 36.6) + 36.6).toFixed(1) // 36.6-37.2
    });
});

app.listen(PORT, () => {
    console.log(`VitalLink Server running on http://localhost:${PORT}`);
});
