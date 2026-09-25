const express = require("express");

const {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
} = require("../controllers/transactionController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getTransactions
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    getTransactionById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    createTransaction
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateTransaction
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteTransaction
);

module.exports = router;