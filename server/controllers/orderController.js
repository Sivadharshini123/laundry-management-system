const pool = require("../config/db");

const getOrders = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM orders ORDER BY order_id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch orders"
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM orders WHERE order_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch order"
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const customerId = req.user.customer_id;

        if (!customerId) {
            return res.status(403).json({
                error: "Customer account required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM orders WHERE customer_id = $1 ORDER BY order_id DESC",
            [customerId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch your orders"
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const {
            customer_id,
            machine_id,
            weight,
            total_amount,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO orders
            (customer_id, machine_id, weight, total_amount, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                customer_id,
                machine_id,
                weight,
                total_amount,
                status || "pending"
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create order"
        });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            customer_id,
            machine_id,
            weight,
            total_amount,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE orders
             SET customer_id = $1,
                 machine_id = $2,
                 weight = $3,
                 total_amount = $4,
                 status = $5
             WHERE order_id = $6
             RETURNING *`,
            [
                customer_id,
                machine_id,
                weight,
                total_amount,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update order"
        });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM orders WHERE order_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.json({
            message: "Order deleted successfully",
            order: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete order"
        });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    getMyOrders,
    createOrder,
    updateOrder,
    deleteOrder
};