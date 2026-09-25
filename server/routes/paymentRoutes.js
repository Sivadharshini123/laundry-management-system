const express = require("express");

const {
    getPayments,
    getPaymentById,
    getMyPayments,
    createPayment,
    updatePayment,
    deletePayment
} = require("../controllers/paymentController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/my-payments",
    authenticateToken,
    authorizeRoles("customer"),
    getMyPayments
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getPayments
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    getPaymentById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    createPayment
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updatePayment
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deletePayment
);

module.exports = router;