const express = require("express");

const {
    getCustomers,
    getCustomerById,
    getMyProfile,
    createCustomer,
    updateCustomer,
    deleteCustomer
} = require("../controllers/customerController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/me",
    authenticateToken,
    authorizeRoles("customer"),
    getMyProfile
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getCustomers
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    getCustomerById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    createCustomer
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateCustomer
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteCustomer
);

module.exports = router;