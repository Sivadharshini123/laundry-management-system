const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            password,
            address
        } = req.body;

        if (
            !name ||
            !phone ||
            !email ||
            !password ||
            !address
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters"
            });
        }

        const existingUser = await pool.query(
            `SELECT user_id
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        const existingCustomer = await pool.query(
            `SELECT customer_id
             FROM customers
             WHERE phone = $1`,
            [phone]
        );

        if (existingCustomer.rows.length > 0) {
            return res.status(409).json({
                error: "An account with this phone number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const customerResult = await client.query(
                `INSERT INTO customers
                 (name, phone, email, address)
                 VALUES ($1, $2, $3, $4)
                 RETURNING customer_id, name, phone, email, address`,
                [
                    name,
                    phone,
                    email,
                    address
                ]
            );

            const customer = customerResult.rows[0];

            const userResult = await client.query(
                `INSERT INTO users
                 (customer_id, email, password, role)
                 VALUES ($1, $2, $3, 'customer')
                 RETURNING user_id, customer_id, email, role`,
                [
                    customer.customer_id,
                    email,
                    hashedPassword
                ]
            );

            await client.query("COMMIT");

            res.status(201).json({
                message: "Account created successfully",
                user: userResult.rows[0],
                customer: customer
            });

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;

        } finally {
            client.release();
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create account"
        });
    }
};


const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const result = await pool.query(
            `SELECT
                user_id,
                customer_id,
                email,
                password,
                role
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                customer_id: user.customer_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure:
                process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 60 * 60 * 1000
        });

        res.json({
            message: "Login successful",
            user: {
                user_id: user.user_id,
                customer_id: user.customer_id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Login failed"
        });
    }
};


const logout = (req, res) => {
    res.clearCookie("token");

    res.json({
        message: "Logout successful"
    });
};


const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                user_id,
                customer_id,
                email,
                role
             FROM users
             WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get user"
        });
    }
};


module.exports = {
    register,
    login,
    logout,
    getMe
};