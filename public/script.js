const API_URL = 'http://localhost:3000/api';

// --- STATE ---
let contactCount = 0;

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
            document.getElementById('fetch-status').textContent = "synced";
            setTimeout(() => document.getElementById('fetch-status').textContent = "", 2000);
        } catch (e) {
            console.error(e);
            alert("Error: Server not reachable.");
        }
    });
}

if (inpUpload) {
    inpUpload.addEventListener('change', () => {
        const file = inpUpload.files[0];
        if (file) {
            document.getElementById('upload-status').textContent = "Scanning " + file.name + "...";
            setTimeout(() => {
                // Simulate OCR Result -> ABNORMAL for demo
                document.getElementById('inp-hr').value = 125;
                document.getElementById('inp-spo2').value = 88;
                document.getElementById('inp-temp').value = 38.2;

                document.getElementById('upload-status').textContent = "Scan Complete.";
                clearResults();
            }, 1000);
        }
    });
}

if (btnAnalyze) {
    btnAnalyze.addEventListener('click', async () => {
        // Validation 1: Inputs
        const hr = document.getElementById('inp-hr').value;
        const spo2 = document.getElementById('inp-spo2').value;
        const temp = document.getElementById('inp-temp').value;

        if (!hr || !spo2 || !temp) {
            alert("Please input all data first.");
            return;
        }

        // Validation 2: Contacts Check (New)
        if (contactCount < 3) {
            const proceed = confirm("⚠️ Warning: You have fewer than 3 emergency contacts configured. SOS messages might not reach everyone. Proceed anyway?");
            if (!proceed) {
                showSection('contacts'); // Redirect to contacts
                return;
            }
        }

        btnAnalyze.textContent = "ANALYZING...";

        try {
            const res = await fetch(`${API_URL}/vitals/analyze`, {
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
    resultArea.innerHTML = '';
}

function renderResult(data) {
    if (!resultArea) return;
    resultArea.classList.remove('hidden');
    resultArea.innerHTML = '';
    resultArea.className = 'result-area'; // reset classes

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
    // If we are on a page with no contacts list (e.g. index.html), exit
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/emergency-contacts`);
        const contacts = await res.json();

        // Update check variable
        contactCount = contacts.length;

        // Show warning on analyze page if needed (if elements exist)
        const warnBox = document.getElementById('contacts-warning');
        if (warnBox) {
            if (contactCount < 3) warnBox.classList.remove('hidden');
            else warnBox.classList.add('hidden');
        }

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
        list.innerHTML = '<tr><td colspan="4">Loading... (Ensure Server is Running)</td></tr>';
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

        await fetch(`${API_URL}/emergency-contacts`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, phoneNumber: phone })
        });

        document.getElementById('edit-modal').classList.add('hidden');
        loadContacts();
    });
}

// Init
document.addEventListener('DOMContentLoaded', loadContacts);

// Helper for UI tabs in user.html
window.showSection = (id) => {
    // Only works if the elements exist (user.html)
    const secAnalyze = document.getElementById('section-analyze');
    const secContacts = document.getElementById('section-contacts');

    if (secAnalyze && secContacts) {
        secAnalyze.classList.add('hidden');
        secContacts.classList.add('hidden');
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));

        document.getElementById('section-' + id).classList.remove('hidden');
        const link = document.querySelector(`a[href="#${id}"]`);
        if (link) link.classList.add('active');

        if (id === 'contacts') loadContacts();
    }
};
