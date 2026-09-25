const pool = require("../config/db");

const getPayments = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM payments ORDER BY payment_id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch payments"
        });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM payments WHERE payment_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Payment not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch payment"
        });
    }
};

const getMyPayments = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        if (!customerId) {
            return res.status(403).json({
                error: "Customer account required"
            });
        }

        const result = await pool.query(
            `SELECT p.*
             FROM payments p
             JOIN orders o
             ON p.order_id = o.order_id
             WHERE o.customer_id = $1
             ORDER BY p.payment_id DESC`,
            [customerId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch your payments"
        });
    }
};

const createPayment = async (req, res) => {
    try {
        const {
            order_id,
            amount,
            payment_method,
            payment_status,
            paid_at
        } = req.body;

        const result = await pool.query(
            `INSERT INTO payments
            (order_id, amount, payment_method, payment_status, paid_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                order_id,
                amount,
                payment_method,
                payment_status || "pending",
                paid_at || null
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create payment"
        });
    }
};

const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            order_id,
            amount,
            payment_method,
            payment_status,
            paid_at
        } = req.body;

        const result = await pool.query(
            `UPDATE payments
             SET order_id = $1,
                 amount = $2,
                 payment_method = $3,
                 payment_status = $4,
                 paid_at = $5
             WHERE payment_id = $6
             RETURNING *`,
            [
                order_id,
                amount,
                payment_method,
                payment_status,
                paid_at,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Payment not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update payment"
        });
    }
};

const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM payments WHERE payment_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Payment not found"
            });
        }

        res.json({
            message: "Payment deleted successfully",
            payment: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete payment"
        });
    }
};

module.exports = {
    getPayments,
    getPaymentById,
    getMyPayments,
    createPayment,
    updatePayment,
    deletePayment
};