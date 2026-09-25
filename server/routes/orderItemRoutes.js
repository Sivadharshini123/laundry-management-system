const express = require("express");

const {
    getOrderItems,
    getOrderItemById,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
} = require("../controllers/orderItemController");

const router = express.Router();

router.get("/", getOrderItems);
router.get("/:id", getOrderItemById);
router.post("/", createOrderItem);
router.put("/:id", updateOrderItem);
router.delete("/:id", deleteOrderItem);

module.exports = router;