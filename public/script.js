const API_URL = 'http://localhost:3000/api';

// --- GEOLOCATION ---
let currentLocation = "Unknown Location";
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            currentLocation = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
            const locEl = document.getElementById('location-display');
            if (locEl) locEl.textContent = currentLocation;
        },
        () => {
            const locEl = document.getElementById('location-display');
            if (locEl) locEl.textContent = "Location Denied (Using Mock)";
            currentLocation = "Mock: New York, NY";
        }
    );
}

// --- DOM ELEMENTS ---
const btnFetch = document.getElementById('btn-fetch');
const inpUpload = document.getElementById('file-upload');
const btnAnalyze = document.getElementById('btn-analyze');
const resultArea = document.getElementById('result-area');

// --- EVENT LISTENERS (Dashboard) ---

if (btnFetch) {
    btnFetch.addEventListener('click', async () => {
        try {
            const res = await fetch(`${API_URL}/vitals/fetch-mock`);
            const data = await res.json();

            document.getElementById('inp-hr').value = data.heartRate;
            document.getElementById('inp-spo2').value = data.spo2;
            document.getElementById('inp-temp').value = data.temperature;

            clearResults();
            alert("Success: Synced with OnePlus Band (Simulated)");
        } catch (e) {
            console.error(e);
            alert("Error: Simulation backend not running?");
        }
    });
}

if (inpUpload) {
    inpUpload.addEventListener('change', () => {
        const file = inpUpload.files[0];
        if (file) {
            document.getElementById('upload-status').textContent = "Scanning " + file.name + "...";
            setTimeout(() => {
                // Simulate OCR Result -> Let's force ABNORMAL for demo purposes when uploading
                document.getElementById('inp-hr').value = 125; // High
                document.getElementById('inp-spo2').value = 88;  // Low
                document.getElementById('inp-temp').value = 38.2; // High

                document.getElementById('upload-status').textContent = "Scan Complete. Data extracted.";
                clearResults();
            }, 1500);
        }
    });
}

if (btnAnalyze) {
    btnAnalyze.addEventListener('click', async () => {
        const hr = document.getElementById('inp-hr').value;
        const spo2 = document.getElementById('inp-spo2').value;
        const temp = document.getElementById('inp-temp').value;

        if (!hr || !spo2 || !temp) {
            alert("Please input all data first.");
            return;
        }

        // Show loading state
        btnAnalyze.textContent = "ANALYZING...";

        try {
            const res = await fetch(`${API_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heartRate: hr,
                    spo2: spo2,
                    temperature: temp,
                    location: currentLocation
                })
            });
            const data = await res.json();
            renderResult(data);
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        } finally {
            btnAnalyze.textContent = "ANALYZE VITALS";
        }
    });
}

// --- RENDERING ---

function clearResults() {
    if (!resultArea) return;
    resultArea.classList.add('hidden');
    resultArea.className = 'result-area hidden';
    resultArea.innerHTML = '';
}

function renderResult(data) {
    if (!resultArea) return;
    resultArea.classList.remove('hidden');
    resultArea.innerHTML = '';

    const h2 = document.createElement('h2');
    const p = document.createElement('p');

    if (data.status === 'OK') {
        resultArea.classList.add('status-ok');
        h2.textContent = "✅ User is OK";
        p.textContent = data.message;
        resultArea.append(h2, p);
    } else {
        resultArea.classList.add('status-sos');
        h2.textContent = "🚨 SOS GENERATED";
        p.textContent = data.message;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'sos-details';
        detailsDiv.innerHTML = `
            <h3>Action Report:</h3>
            <div class="log-item">
                <span class="icon">📩</span> 
                <span>WhatsApp: <strong>${data.details.whatsappStatus}</strong> to 3 contacts</span>
            </div>
            <div class="log-item">
                <span class="icon">💬</span> 
                <span>SMS: <strong>${data.details.smsStatus}</strong> to 3 contacts</span>
            </div>
            <hr style="border: 0; border-top: 1px solid #555; margin: 10px 0;">
            <div><strong>Abnormal Fields:</strong> ${data.details.abnormalFields.join(', ')}</div>
        `;
        resultArea.append(h2, p, detailsDiv);
    }
}

// --- CONTACTS PAGE LOGIC ---

async function loadContacts() {
    const list = document.getElementById('contacts-list');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/contacts`);
        const contacts = await res.json();
        list.innerHTML = '';
        contacts.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.priority}</td>
                <td>${c.name}</td>
                <td>${c.phoneNumber}</td>
                <td><button class="btn secondary-btn" onclick="openEdit(${c.id}, '${c.name}', '${c.phoneNumber}')">Edit</button></td>
            `;
            list.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = '<tr><td colspan="4">Error loading data. Is server running?</td></tr>';
    }
}

// Global scope for onclick
window.openEdit = (id, name, phone) => {
    document.getElementById('edit-modal').classList.remove('hidden');
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-phone').value = phone;
};

const btnCancel = document.getElementById('btn-cancel');
if (btnCancel) {
    btnCancel.addEventListener('click', () => {
        document.getElementById('edit-modal').classList.add('hidden');
    });
}

const btnSave = document.getElementById('btn-save');
if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-name').value;
        const phone = document.getElementById('edit-phone').value;

        await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, phoneNumber: phone })
        });

        document.getElementById('edit-modal').classList.add('hidden');
        loadContacts();
    });
}
