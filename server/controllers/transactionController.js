const pool = require("../config/db");

const getTransactions = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM transactions ORDER BY transaction_id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch transactions"
        });
    }
};

const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM transactions WHERE transaction_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch transaction"
        });
    }
};

const createTransaction = async (req, res) => {
    try {
        const {
            payment_id,
            transaction_type,
            transaction_ref,
            amount,
            status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO transactions
            (payment_id, transaction_type, transaction_ref, amount, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                payment_id,
                transaction_type,
                transaction_ref,
                amount,
                status || "pending"
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create transaction"
        });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            payment_id,
            transaction_type,
            transaction_ref,
            amount,
            status
        } = req.body;

        const result = await pool.query(
            `UPDATE transactions
             SET payment_id = $1,
                 transaction_type = $2,
                 transaction_ref = $3,
                 amount = $4,
                 status = $5
             WHERE transaction_id = $6
             RETURNING *`,
            [
                payment_id,
                transaction_type,
                transaction_ref,
                amount,
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update transaction"
        });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM transactions WHERE transaction_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted successfully",
            transaction: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete transaction"
        });
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
};