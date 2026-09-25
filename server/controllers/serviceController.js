const pool = require("../config/db");

const getServices = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM services ORDER BY service_id"
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch services" });
    }
};

const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM services WHERE service_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch service" });
    }
};

const createService = async (req, res) => {
    try {
        const { service_name, description, price_per_kg } = req.body;

        const result = await pool.query(
            `INSERT INTO services
            (service_name, description, price_per_kg)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [service_name, description, price_per_kg]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create service" });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { service_name, description, price_per_kg } = req.body;

        const result = await pool.query(
            `UPDATE services
             SET service_name = $1,
                 description = $2,
                 price_per_kg = $3
             WHERE service_id = $4
             RETURNING *`,
            [service_name, description, price_per_kg, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update service" });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM services WHERE service_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.json({
            message: "Service deleted successfully",
            service: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete service" });
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};