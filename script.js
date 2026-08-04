// --- 1. INITIALIZE & LOAD DATA ---
async function getSuncrestData() {
    let localData = localStorage.getItem('suncrest_full_data');
    if (localData) {
        return JSON.parse(localData);
    } else {
        try {
            let response = await fetch('data.json');
            let data = await response.json();
            // Ensure a users array exists in the data structure
            if (!data.users) data.users = [];
            localStorage.setItem('suncrest_full_data', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error loading data.json:', error);
            return { users: [] };
        }
    }
}

// --- 2. ADMIN PORTAL: ADD CRUISE TO ANY CLIENT ---
document.addEventListener('DOMContentLoaded', async () => {
    const addCruiseForm = document.getElementById('addCruiseForm'); // Match your admin form ID
    
    if (addCruiseForm) {
        addCruiseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Grab inputs from your admin panel form
            const targetId = document.getElementById('targetClientId').value.trim();
            const shipName = document.getElementById('shipNameInput').value;
            const sailDate = document.getElementById('sailDateInput').value;
            const points = document.getElementById('pointsInput').value;
            const itinerary = document.getElementById('itineraryInput').value || "General Itinerary";

            let siteData = await getSuncrestData();

            // Find client by Funisquad ID (case-insensitive)
            let targetUser = siteData.users.find(u => u.funisquadId.trim().toUpperCase() === targetId.toUpperCase());

            if (targetUser) {
                if (!targetUser.pastCruises) {
                    targetUser.pastCruises = [];
                }

                // Push new cruise object
                targetUser.pastCruises.push({
                    shipName: shipName,
                    sailDate: sailDate,
                    bookingId: "N/A",
                    itinerary: itinerary,
                    points: `${points} Points`
                });

                // Save back to browser storage
                localStorage.setItem('suncrest_full_data', JSON.stringify(siteData));
                alert(`Success! Cruise added to client: ${targetUser.name}`);
                addCruiseForm.reset();
            } else {
                alert('Client ID not found in the database. Make sure the ID matches their profile exactly.');
            }
        });
    }

    // --- 3. CLIENT DASHBOARD: RENDER CURRENT USER'S CRUISES ---
    const container = document.getElementById('pastCruisesContainer'); // Match your dashboard container ID
    if (container) {
        let siteData = await getSuncrestData();
        
        // Identify who is currently viewing the page (checks local storage session)
        let activeSessionId = localStorage.getItem('current_user_id'); 

        let currentUser = siteData.users.find(u => u.funisquadId === activeSessionId);

        if (currentUser && currentUser.pastCruises && currentUser.pastCruises.length > 0) {
            container.innerHTML = '';
            currentUser.pastCruises.forEach(cruise => {
                container.innerHTML += `
                    <div style="background: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h4 style="margin: 0 0 5px 0; color: #003366;">${cruise.shipName}</h4>
                        <p style="margin: 3px 0;">Sail Date: ${cruise.sailDate}</p>
                        <p style="margin: 3px 0;">Port/Itinerary: ${cruise.itinerary}</p>
                        <span style="background: #ff6600; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${cruise.points}</span>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `<p>No past cruises recorded yet. Reach out to an admin or travel agent to credit previous sailings.</p>`;
        }
    }
});// Example Login / Session Handler
async function handleUserLogin(enteredEmail, enteredName) {
    let siteData = await getSuncrestData();

    // Check if this user already exists in your database by email
    let existingUser = siteData.users.find(u => u.email && u.email.toLowerCase() === enteredEmail.toLowerCase());

    if (existingUser) {
        // MATCH FOUND: Use their existing Funisquad ID so it never changes!
        localStorage.setItem('current_user_id', existingUser.funisquadId);
        console.log("Logged into existing account:", existingUser.funisquadId);
    } else {
        // NEW USER: Only generate a new ID if they don't exist yet
        let newId = "SUN-" + Math.floor(10000 + Math.random() * 90000);
        
        let newUser = {
            funisquadId: newId,
            name: enteredName,
            email: enteredEmail,
            tier: "Blue",
            pastCruises: []
        };
        
        siteData.users.push(newUser);
        localStorage.setItem('suncrest_full_data', JSON.stringify(siteData));
        localStorage.setItem('current_user_id', newId);
        console.log("Created new account:", newId);
    }
}
