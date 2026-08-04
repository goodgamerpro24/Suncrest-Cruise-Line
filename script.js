// Example Login / Session Handler
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
