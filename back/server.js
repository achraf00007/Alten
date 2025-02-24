require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const FILE_PATH = "../front/src/assets/products.json";
const USERS_FILE = "./data/users.json";
const SECRET_KEY = process.env.JWT_SECRET || "super_secret_key";
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "2h";

app.use(cors({
    origin: process.env.Site_URL || "http://localhost:4200",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(bodyParser.json());

// Lire les produits
const readProducts = () => {
    try {
        return fs.readJsonSync(FILE_PATH);
    } catch (error) {
        return [];
    }
};

// Écrire dans les produits
const writeProducts = (products) => {
    fs.writeJsonSync(FILE_PATH, products, { spaces: 2 });
};

// Lire les utilisateurs
const getUsers = async () => {
    return await fs.readJson(USERS_FILE).catch(() => []);
};

// Sauvegarder les utilisateurs
const saveUsers = async (users) => {
    await fs.writeJson(USERS_FILE, users);
};

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    
    if (!token) {
        console.log("❌ Accès refusé : Aucun token reçu !");
        return res.status(403).json({ error: "Accès refusé. Token manquant" });
    }

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log("❌ Token invalide :", err);
            return res.status(401).json({ error: "Token invalide" });
        }
        req.user = decoded;
        console.log("✅ Token validé :", req.user);
        next();
    });
};

// Middleware pour restreindre l'accès à l'admin
const verifyAdmin = (req, res, next) => {
    if (req.user.email !== "admin@admin.com") {
        console.log("❌ Accès refusé : Non administrateur !");
        return res.status(403).json({ error: "Accès refusé. Admin requis" });
    }
    next();
};

// ==================== Authentification ====================

// Création d'un compte utilisateur
app.post("/api/account", async (req, res) => {
    const { username, firstname, email, password } = req.body;
    
    if (!username || !firstname || !email || !password) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    let users = await getUsers();

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, firstname, email, password: hashedPassword };
    
    users.push(newUser);
    await saveUsers(users);

    res.status(201).json({ message: "Compte créé avec succès" });
});

// Connexion et génération de token JWT
app.post("/api/token", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    let users = await getUsers();
    const user = users.find(user => user.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log("❌ Tentative de connexion avec email ou mot de passe incorrect !");
        return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        SECRET_KEY,
        { expiresIn: TOKEN_EXPIRATION }
    );

    res.json({ message: "Connexion réussie", token });
});

// ==================== Gestion des produits ====================

// Récupérer tous les produits
app.get("/api/products", verifyToken, (req, res) => {
    res.json(readProducts());
});

// Ajouter un produit (admin)
app.post("/api/products", verifyToken, verifyAdmin, (req, res) => {
    const products = readProducts();
    const newProduct = { id: Date.now(), ...req.body };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

// Modifier un produit (admin)
app.patch("/api/products/:id", verifyToken, verifyAdmin, (req, res) => {
    const products = readProducts();
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Produit introuvable" });

    products[index] = { ...products[index], ...req.body };
    writeProducts(products);
    res.json(products[index]);
});

// Supprimer un produit (admin)
app.delete("/api/products/:id", verifyToken, verifyAdmin, (req, res) => {
    let products = readProducts();
    products = products.filter(p => p.id !== parseInt(req.params.id));
    writeProducts(products);
    res.json({ message: "Produit supprimé avec succès" });
});

// ==================== Send mail ====================
app.post("/api/send-email", async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Message du nouveau contact",
        text: `Email: ${email}\nMessage: ${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email envoyé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
    }
});

// ==================== Démarrage du serveur ====================
app.get("/", (req, res) => {
    res.send("🚀 Le serveur fonctionne correctement !");
});

app.listen(PORT, () => {
    console.log(`✅ Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
