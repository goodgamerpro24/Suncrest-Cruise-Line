// --- 1. INITIALIZE & LOAD DATA ---
async function getSuncrestData() {
    let localData = localStorage.getItem('suncrest_full_data');
    if (localData) {
        return JSON.parse(localData);
    } else {
        try {
            let response = await fetch('data.json');
            let data = await response.json();
            if (!data.users) data.users = [];
            localStorage.setItem('suncrest_full_data', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error loading data.json:', error);
            return { users: [] };
        }
    }
}

// --- 2. LOGIN HANDLER (Keeps your ID consistent by checking email) ---
async function handleUserLogin(enteredEmail, enteredName) {
    let siteData = await getSuncrestData();

    // Look for existing user by email
    let existingUser = siteData.users.find(u => u.email && u.email.toLowerCase() === enteredEmail.toLowerCase());

    if (existingUser) {
        // MATCH FOUND: Keeps your exact same Funisquad ID forever!
        localStorage.setItem('current_user_id', existingUser.funisquadId);
        console.log("Logged into existing account:", existingUser.funisquadId);
        return existingUser.funisquadId;
    } else {
        // NEW USER: Create an ID only if they don't exist
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
        return newId;
    }
}

// --- 3. PAGE ACTIONS (Admin, Dashboard, & Login triggers) ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // A. ADMIN PORTAL: ADD CRUISE TO ANY CLIENT
    const addCruiseForm = document.getElementById('addCruiseForm'); 
    if (addCruiseForm) {
        addCruiseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const targetId = document.getElementById('targetClientId').value.trim();
            const shipName = document.getElementById('shipNameInput').value;
            const sailDate = document.getElementById('sailDateInput').value;
            const points = document.getElementById('pointsInput').value;
            const itinerary = document.getElementById('itineraryInput').value || "General Itinerary";

            let siteData = await getSuncrestData();
            let targetUser = siteData.users.find(u => u.funisquadId.trim().toUpperCase() === targetId.toUpperCase());

            if (targetUser) {
                if (!targetUser.pastCruises) {
                    targetUser.pastCruises = [];
                }

                targetUser.pastCruises.push({
                    shipName: shipName,
                    sailDate: sailDate,
                    bookingId: "N/A",
                    itinerary: itinerary,
                    points: `${points} Points`
                });

                localStorage.setItem('suncrest_full_data', JSON.stringify(siteData));
                alert(`Success! Cruise added to client: ${targetUser.name}`);
                addCruiseForm.reset();
            } else {
                alert('Client ID not found in the database. Make sure the ID matches their profile exactly.');
            }
        });
    }

    // B. CLIENT DASHBOARD: RENDER CURRENT USER'S CRUISES
    const container = document.getElementById('pastCruisesContainer'); 
    if (container) {
        let siteData = await getSuncrestData();
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

    // C. LOGIN FORM AUTOMATION
    const loginForm = document.getElementById('loginForm'); // Matches your login form ID
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const enteredEmail = document.getElementById('loginEmailInput').value.trim();
            const enteredName = document.getElementById('loginNameInput').value.trim();

            await handleUserLogin(enteredEmail, enteredName);

            // Automatically head to the dashboard after logging in
            window.location.href = 'dashboard.html'; // Change to your actual dashboard HTML file name if different
        });
    }
});
