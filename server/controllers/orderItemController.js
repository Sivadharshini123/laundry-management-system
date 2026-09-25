const pool = require("../config/db");

const getOrderItems = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM order_items ORDER BY order_item_id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch order items"
        });
    }
};

const getOrderItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM order_items WHERE order_item_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order item not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch order item"
        });
    }
};

const createOrderItem = async (req, res) => {
    try {
        const {
            order_id,
            service_id,
            quantity,
            price,
            subtotal
        } = req.body;

        const result = await pool.query(
            `INSERT INTO order_items
            (order_id, service_id, quantity, price, subtotal)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                order_id,
                service_id,
                quantity,
                price,
                subtotal
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create order item"
        });
    }
};

const updateOrderItem = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            order_id,
            service_id,
            quantity,
            price,
            subtotal
        } = req.body;

        const result = await pool.query(
            `UPDATE order_items
             SET order_id = $1,
                 service_id = $2,
                 quantity = $3,
                 price = $4,
                 subtotal = $5
             WHERE order_item_id = $6
             RETURNING *`,
            [
                order_id,
                service_id,
                quantity,
                price,
                subtotal,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order item not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update order item"
        });
    }
};

const deleteOrderItem = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM order_items WHERE order_item_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Order item not found"
            });
        }

        res.json({
            message: "Order item deleted successfully",
            orderItem: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete order item"
        });
    }
};

module.exports = {
    getOrderItems,
    getOrderItemById,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
};