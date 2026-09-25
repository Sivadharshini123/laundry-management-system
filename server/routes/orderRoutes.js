const express = require("express");

const {
    getOrders,
    getOrderById,
    getMyOrders,
    createOrder,
    updateOrder,
    deleteOrder
} = require("../controllers/orderController");

const {
    checkout
} = require("../controllers/checkoutController");

const authenticateToken = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/my-orders",
    authenticateToken,
    authorizeRoles("customer"),
    getMyOrders
);

router.post(
    "/checkout",
    authenticateToken,
    authorizeRoles("customer"),
    checkout
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getOrders
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    getOrderById
);

router.post(
    "/checkout",
    authenticateToken,
    checkout
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateOrder
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteOrder
);

module.exports = router;