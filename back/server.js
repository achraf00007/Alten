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
const CART_FILE = "./data/cart.json";
const WISHLIST_FILE = "./data/wishlist.json";

const SECRET_KEY = process.env.JWT_SECRET || "super_secret_key";
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "2h";

app.use(cors({
    origin: process.env.Site_URL || "http://localhost:4200",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(bodyParser.json());

// Lire un fichier JSON
const readJsonFile = (file) => fs.readJsonSync(file, { throws: false }) || [];

// Écrire dans un fichier JSON
const writeJsonFile = (file, data) => fs.writeJsonSync(file, data, { spaces: 2 });

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "Accès refusé. Token manquant" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token invalide" });
        req.user = decoded;
        next();
    });
};

// Middleware pour restreindre l'accès à l'admin
const verifyAdmin = (req, res, next) => {
    if (req.user.email !== "admin@admin.com") {
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

    let users = readJsonFile(USERS_FILE);

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), username, firstname, email, password: hashedPassword };
    
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);

    res.status(201).json({ message: "Compte créé avec succès" });
});

// Connexion et génération de token JWT
app.post("/api/token", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    let users = readJsonFile(USERS_FILE);
    const user = users.find(user => user.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        SECRET_KEY,
        { expiresIn: TOKEN_EXPIRATION }
    );

    res.json({ message: "Connexion réussie", token });
});

// ==================== Gestion des produits ====================

// Récupérer tous les produits
app.get("/api/products", (req, res) => {
    res.json(readJsonFile(FILE_PATH));
});

// Ajouter un produit (admin)
app.post("/api/products", verifyToken, verifyAdmin, (req, res) => {
    const products = readJsonFile(FILE_PATH);
    const newProduct = { id: Date.now(), ...req.body };
    products.push(newProduct);
    writeJsonFile(FILE_PATH, products);
    res.status(201).json(newProduct);
});

// Modifier un produit (admin)
app.patch("/api/products/:id", verifyToken, verifyAdmin, (req, res) => {
    const products = readJsonFile(FILE_PATH);
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Produit introuvable" });

    products[index] = { ...products[index], ...req.body };
    writeJsonFile(FILE_PATH, products);
    res.json(products[index]);
});

// Supprimer un produit (admin)
app.delete("/api/products/:id", verifyToken, verifyAdmin, (req, res) => {
    let products = readJsonFile(FILE_PATH);
    products = products.filter(p => p.id !== parseInt(req.params.id));
    writeJsonFile(FILE_PATH, products);
    res.json({ message: "Produit supprimé avec succès" });
});

// ==================== Gestion du panier ====================

// Ajouter un produit au panier
app.post("/api/cart", verifyToken, (req, res) => {
    let cart = readJsonFile(CART_FILE);
    cart.push({ userId: req.user.userId, ...req.body });
    writeJsonFile(CART_FILE, cart);
    res.status(201).json({ message: "Produit ajouté au panier" });
});

// Récupérer le panier de l'utilisateur
app.get("/api/cart", verifyToken, (req, res) => {
    const cart = readJsonFile(CART_FILE).filter(item => item.userId === req.user.userId);
    res.json(cart);
});

// Supprimer un produit du panier
app.delete("/api/cart/:id", verifyToken, (req, res) => {
    let cart = readJsonFile(CART_FILE);
    cart = cart.filter(item => item.userId !== req.user.userId || item.id !== parseInt(req.params.id));
    writeJsonFile(CART_FILE, cart);
    res.json({ message: "Produit retiré du panier" });
});

// ==================== gestion de la wishlist ====================

// Ajouter un produit à la wishlist
app.post("/api/wishlist", verifyToken, (req, res) => {
    let wishlist = readJsonFile(WISHLIST_FILE);
    wishlist.push({ userId: req.user.userId, ...req.body });
    writeJsonFile(WISHLIST_FILE, wishlist);
    res.status(201).json({ message: "Produit ajouté à la wishlist" });
});

// Récupérer la wishlist de l'utilisateur
app.get("/api/wishlist", verifyToken, (req, res) => {
    const wishlist = readJsonFile(WISHLIST_FILE).filter(item => item.userId === req.user.userId);
    res.json(wishlist);
});

// Supprimer un produit de la wishlist
app.delete("/api/wishlist/:id", verifyToken, (req, res) => {
    let wishlist = readJsonFile(WISHLIST_FILE);
    wishlist = wishlist.filter(item => item.userId !== req.user.userId || item.id !== parseInt(req.params.id));
    writeJsonFile(WISHLIST_FILE, wishlist);
    res.json({ message: "Produit retiré de la wishlist" });
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

// ====================================================================================================

app.get("/", (req, res) => {
    res.send("🚀 Le serveur fonctionne correctement !");
});

app.listen(PORT, () => {
    console.log(`✅ Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
