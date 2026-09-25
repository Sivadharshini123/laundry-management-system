const express = require("express");

const {
    getMachines,
    getMachineById,
    createMachine,
    updateMachine,
    deleteMachine
} = require("../controllers/machineController");

const router = express.Router();

router.get("/", getMachines);
router.get("/:id", getMachineById);
router.post("/", createMachine);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);

module.exports = router;