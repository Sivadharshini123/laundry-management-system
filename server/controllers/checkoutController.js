const pool = require("../config/db");

const checkout = async (req, res) => {
    const client = await pool.connect();

    try {
        const customerId = req.user.customer_id;
        const { items } = req.body;

        if (!customerId) {
            return res.status(403).json({
                error: "Customer account required"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: "Cart cannot be empty"
            });
        }

        for (const item of items) {
            if (
                !item.service_id ||
                !item.weight ||
                Number(item.weight) <= 0
            ) {
                return res.status(400).json({
                    error: "Invalid service or weight"
                });
            }
        }

        await client.query("BEGIN");

        const serviceIds = items.map(
            (item) => Number(item.service_id)
        );

        const servicesResult = await client.query(
            `SELECT service_id, service_name, price_per_kg
             FROM services
             WHERE service_id = ANY($1::int[])`,
            [serviceIds]
        );

        if (
            servicesResult.rows.length !==
            serviceIds.length
        ) {
            throw new Error(
                "One or more services are invalid"
            );
        }

        const servicesMap = new Map();

        for (const service of servicesResult.rows) {
            servicesMap.set(
                service.service_id,
                service
            );
        }

        let totalWeight = 0;
        let totalAmount = 0;

        const orderItems = [];

        for (const item of items) {
            const service = servicesMap.get(
                Number(item.service_id)
            );

            const weight = Number(item.weight);
            const price = Number(service.price_per_kg);

            const subtotal = weight * price;

            totalWeight += weight;
            totalAmount += subtotal;

            orderItems.push({
                service_id: service.service_id,
                quantity: weight,
                price: price,
                subtotal: subtotal
            });
        }

        const machineResult = await client.query(
            `SELECT machine_id, capacity
             FROM machines
             WHERE status = 'available'
             AND capacity >= $1
             ORDER BY capacity ASC
             LIMIT 1
             FOR UPDATE`,
            [totalWeight]
        );

        if (machineResult.rows.length === 0) {
            throw new Error(
                "No suitable washing machine is available"
            );
        }

        const machine = machineResult.rows[0];

        const orderResult = await client.query(
            `INSERT INTO orders
             (customer_id, machine_id, weight, total_amount, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING *`,
            [
                customerId,
                machine.machine_id,
                totalWeight,
                totalAmount
            ]
        );

        const order = orderResult.rows[0];

        for (const item of orderItems) {
            await client.query(
                `INSERT INTO order_items
                 (order_id, service_id, quantity, price, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    order.order_id,
                    item.service_id,
                    item.quantity,
                    item.price,
                    item.subtotal
                ]
            );
        }

        const paymentResult = await client.query(
            `INSERT INTO payments
             (order_id, amount, payment_method, payment_status)
             VALUES ($1, $2, 'cash', 'pending')
             RETURNING *`,
            [
                order.order_id,
                totalAmount
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Order placed successfully",
            order: order,
            payment: paymentResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            error:
                error.message ||
                "Failed to place order"
        });

    } finally {
        client.release();
    }
};

module.exports = {
    checkout
};