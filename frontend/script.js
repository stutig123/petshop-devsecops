const API_URL = "http://localhost:3000";

// 🔹 Register User
function registerUser() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;

    fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => console.error("Error:", err));
}

// 🔹 Login User
function loginUser() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Login successful") {
            localStorage.setItem("username", username);
            localStorage.setItem("role", data.role);
            alert("Login successful!");
            updateDashboard();
        } else {
            alert("Invalid credentials");
        }
    })
    .catch(err => console.error("Error:", err));
}

// 🔹 Logout
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    alert("Logged out!");
    updateDashboard();
}

// 🔹 Update Dashboard (Show/Hide Sections Based on Role)
function updateDashboard() {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    const authSection = document.getElementById("auth-section");
    const dashboard = document.getElementById("dashboard");
    const addPetSection = document.getElementById("add-pet-section");

    if (username) {
        authSection.style.display = "none";
        dashboard.style.display = "block";
        fetchPets();

        if (role === "manager") {
            addPetSection.style.display = "block"; // Show "Add Pet" section
        } else {
            addPetSection.style.display = "none"; // Hide it for users
        }
    } else {
        authSection.style.display = "block";
        dashboard.style.display = "none";
    }
}

// 🔹 Fetch and Display Available Pets
function fetchPets() {
    fetch(`${API_URL}/pets`)
    .then(res => res.json())
    .then(pets => {
        const petsList = document.getElementById("pets-list");
        petsList.innerHTML = ""; // Clear previous entries

        pets.forEach(pet => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${pet.petName}</strong> - ${pet.petType} - $${pet.price}
                    ${pet.imageUrl ? `<br><img src="${pet.imageUrl}" width="150" height="150" onerror="this.style.display='none';"/>` : ""}
                    <br><button onclick="buyPet(${pet.id})">Buy</button>
                </div>`;
            petsList.appendChild(li);
        });
    })
    .catch(err => console.error("Error:", err));
}

// 🔹 Add Pet (Only for Managers)
function addPet() {
    const username = localStorage.getItem("username");
    const petName = document.getElementById("pet-name").value;
    const petType = document.getElementById("pet-type").value;
    const price = document.getElementById("pet-price").value;
    const petImage = document.getElementById("pet-image").files[0];

    if (!username || !petName || !petType || !price || !petImage) {
        alert("All fields are required!");
        return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("petName", petName);
    formData.append("petType", petType);
    formData.append("price", price);
    formData.append("image", petImage);

    fetch(`${API_URL}/add-pet`, {
        method: "POST",
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        fetchPets(); // Refresh pet list
    })
    .catch(err => console.error("Error:", err));
}

// 🔹 Buy Pet (Only for Users)
// 🔹 Buy Pet (Users)
function buyPet(petId) {
    const username = localStorage.getItem("username");

    fetch("http://localhost:3000/buy-pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, petId }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);

        if (data.invoiceUrl) {
            const invoiceContainer = document.getElementById("invoice-container");
            invoiceContainer.innerHTML = `<a href="http://localhost:3000${data.invoiceUrl}" target="_blank" download>Download Invoice</a>`;
        }

        loadPets();  // Refresh pet list after purchase
    })
    .catch(error => console.error("Error buying pet:", error));
}


// 🔹 Initialize App on Load
document.addEventListener("DOMContentLoaded", updateDashboard);
