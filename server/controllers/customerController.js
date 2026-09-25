const pool = require("../config/db");

const getCustomers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM customers ORDER BY customer_id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch customers"
        });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM customers WHERE customer_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch customer"
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        if (!customerId) {
            return res.status(403).json({
                error: "Customer profile not available"
            });
        }

        const result = await pool.query(
            "SELECT * FROM customers WHERE customer_id = $1",
            [customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer profile not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch profile"
        });
    }
};

const createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        const result = await pool.query(
            "INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, phone, email, address]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create customer"
        });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address } = req.body;

        const result = await pool.query(
            "UPDATE customers SET name = $1, phone = $2, email = $3, address = $4 WHERE customer_id = $5 RETURNING *",
            [name, phone, email, address, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update customer"
        });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM customers WHERE customer_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }

        res.json({
            message: "Customer deleted successfully",
            customer: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete customer"
        });
    }
};

module.exports = {
    getCustomers,
    getCustomerById,
    getMyProfile,
    createCustomer,
    updateCustomer,
    deleteCustomer
};