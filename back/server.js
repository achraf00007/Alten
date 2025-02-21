require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 5000;
const FILE_PATH = "../front/src/assets/products.json";

app.use(cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(bodyParser.json());

const readProducts = () => {
    try {
        const data = fs.readFileSync(FILE_PATH);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeProducts = (products) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2));
};

// ====================== Product api's =======================

// Retrieve all products
app.get("/api/products", (req, res) => {
    const products = readProducts();
    res.json(products);
});

// Add a new product
app.post("/api/products", (req, res) => {
    const products = readProducts();
    const newProduct = { id: Date.now(), ...req.body };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

// Retrieve a product by ID
app.get("/api/products/:id", (req, res) => {
    const products = readProducts();
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
});

// Update a product by ID
app.patch("/api/products/:id", (req, res) => {
    const products = readProducts();
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Product not found" });

    products[index] = { ...products[index], ...req.body };
    writeProducts(products);
    res.json(products[index]);
});

// Delete a product by ID
app.delete("/api/products/:id", (req, res) => {
    let products = readProducts();
    products = products.filter(p => p.id !== parseInt(req.params.id));
    writeProducts(products);
    res.json({ message: "Product deleted successfully" });
});

// ====================== Email sending api =======================

app.post("/api/send-email", async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: "All fields are required" });
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
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error sending email" });
    }
});

app.get("/", (req, res) => {
    res.send("🚀 The server is running successfully!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
