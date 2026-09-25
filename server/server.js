const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const pool = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const machineRoutes = require("./routes/machineRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Security middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Test backend
app.get("/", (req, res) => {
    res.send("Laundry Management System Backend is running!");
});

// Test database
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send("Database connection failed");
    }
});

// API routes
app.use("/api/customers", customerRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});