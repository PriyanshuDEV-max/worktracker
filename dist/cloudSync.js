// --- Cloud Sync Configuration ---
const SYNC_ENDPOINT = '/.netlify/functions/sync';
const SYNC_TOKEN = 'SUPER_SECRET_TOKEN_12345'; 

async function saveState() {
    localStorage.setItem('momentumProOS', JSON.stringify(appState));
    try {
        await fetch(SYNC_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SYNC_TOKEN}`
            },
            body: JSON.stringify(appState)
        });
    } catch (e) {
        console.warn("Local data saved. Cloud sync offline:", e);
    }
}

async function loadState() {
    try {
        const response = await fetch(SYNC_ENDPOINT, {
            headers: { 'Authorization': `Bearer ${SYNC_TOKEN}` }
        });
        if (response.ok) {
            const cloudData = await response.json();
            if (cloudData && Object.keys(cloudData).length > 0) {
                appState = cloudData;
                return;
            }
        }
    } catch (e) {
        console.warn("Cloud load offline, falling back to local storage.");
    }
    const localData = localStorage.getItem('momentumProOS');
    if (localData) appState = JSON.parse(localData);
}
