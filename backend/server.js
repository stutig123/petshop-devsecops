const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// ✅ Ensure essential folders exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("data")) fs.mkdirSync("data");

// ✅ Ensure pets.json exists
const PETS_FILE = "data/pets.json";
if (!fs.existsSync(PETS_FILE)) fs.writeFileSync(PETS_FILE, "[]", "utf-8");

// ✅ Ensure users.json exists
const USERS_FILE = "data/users.json";
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf-8");

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // ✅ Fix image serving

// ✅ Load Users
const loadUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")) || [];
    } catch (error) {
        console.error("❌ Error reading users.json:", error);
        return [];
    }
};

// ✅ Save Users
const saveUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
        console.log("✅ users.json updated successfully!");
    } catch (error) {
        console.error("❌ Error saving users.json:", error);
    }
};

// ✅ Load Pets
const loadPets = () => {
    try {
        return JSON.parse(fs.readFileSync(PETS_FILE, "utf-8")) || [];
    } catch (error) {
        console.error("❌ Error reading pets.json:", error);
        return [];
    }
};

// ✅ Save Pets
const savePets = (pets) => {
    try {
        fs.writeFileSync(PETS_FILE, JSON.stringify(pets, null, 2), "utf-8");
        console.log("✅ pets.json updated successfully!");
    } catch (error) {
        console.error("❌ Error saving pets.json:", error);
    }
};

// ✅ Multer Setup for Image Uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// ✅ Register User
app.post("/register", (req, res) => {
    const { username, password, role } = req.body;
    let users = loadUsers();

    if (users.find((u) => u.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    users.push({ username, password, role });
    saveUsers(users);

    res.json({ message: "Registration successful!" });
});

// ✅ Login User
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", role: user.role });
});

// ✅ Add Pet (Only Manager)
app.post("/add-pet", upload.single("image"), (req, res) => {
    const { username, petName, petType, price } = req.body;
    const users = loadUsers();
    const pets = loadPets();

    const user = users.find((u) => u.username === username);
    if (!user || user.role !== "manager") {
        return res.status(403).json({ message: "Only managers can add pets." });
    }

    const newPet = {
        id: Date.now(),
        petName,
        petType,
        price,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
    };

    pets.push(newPet);
    savePets(pets);

    res.json({ message: "Pet added successfully!", pet: newPet });
});

// ✅ Buy Pet (Users)
app.post("/buy-pet", (req, res) => {
    const { username, petId } = req.body;
    const users = loadUsers();
    let pets = loadPets();

    const user = users.find((u) => u.username === username);
    if (!user || user.role !== "user") {
        return res.status(403).json({ message: "Only users can buy pets." });
    }

    const petIndex = pets.findIndex((p) => p.id == petId);
    if (petIndex === -1) {
        return res.status(404).json({ message: "Pet not found" });
    }

    pets.splice(petIndex, 1);
    savePets(pets);

    res.json({ message: "Pet purchased successfully!" });
});

// ✅ Get Pets
app.get("/pets", (req, res) => {
    res.json(loadPets());
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
