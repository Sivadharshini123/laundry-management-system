const pool = require("../config/db");

const getMachines = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM machines ORDER BY machine_id"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch machines" });
    }
};

const getMachineById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM machines WHERE machine_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Machine not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch machine" });
    }
};

const createMachine = async (req, res) => {
    try {
        const { machine_name, machine_type, status, capacity } = req.body;

        const result = await pool.query(
            `INSERT INTO machines
            (machine_name, machine_type, status, capacity)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [machine_name, machine_type, status, capacity]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create machine" });
    }
};

const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const { machine_name, machine_type, status, capacity } = req.body;

        const result = await pool.query(
            `UPDATE machines
             SET machine_name = $1,
                 machine_type = $2,
                 status = $3,
                 capacity = $4
             WHERE machine_id = $5
             RETURNING *`,
            [machine_name, machine_type, status, capacity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Machine not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update machine" });
    }
};

const deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM machines WHERE machine_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Machine not found" });
        }

        res.json({
            message: "Machine deleted successfully",
            machine: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete machine" });
    }
};

module.exports = {
    getMachines,
    getMachineById,
    createMachine,
    updateMachine,
    deleteMachine
};