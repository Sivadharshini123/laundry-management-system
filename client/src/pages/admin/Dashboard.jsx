import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";

function Dashboard({ customers, orders, machines, payments }) {
    const completedOrders = orders.filter(
        (order) => order.status === "completed"
    ).length;

    const activeOrders = orders.filter(
        (order) =>
            order.status === "pending" ||
            order.status === "processing"
    ).length;

    const availableMachines = machines.filter(
        (machine) => machine.status === "available"
    ).length;

    const totalRevenue = payments
        .filter(
            (payment) => payment.payment_status === "paid"
        )
        .reduce(
            (total, payment) =>
                total + Number(payment.amount),
            0
        );

    return (
        <div>
            <div style={styles.cards}>
                <StatCard
                    title="Total Customers"
                    value={customers.length}
                />

                <StatCard
                    title="Total Orders"
                    value={orders.length}
                />

                <StatCard
                    title="Active Orders"
                    value={activeOrders}
                />

                <StatCard
                    title="Available Machines"
                    value={availableMachines}
                />

                <StatCard
                    title="Revenue"
                    value={`₹${totalRevenue}`}
                />
            </div>

            <div style={styles.section}>
                <h2>Recent Orders</h2>

                {orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer ID</th>
                                <th>Weight</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.slice(0, 5).map((order) => (
                                <tr key={order.order_id}>
                                    <td>#{order.order_id}</td>
                                    <td>#{order.customer_id}</td>
                                    <td>{order.weight} kg</td>
                                    <td>₹{order.total_amount}</td>
                                    <td>
                                        <StatusBadge
                                            status={order.status}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const styles = {
    cards: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
    },

    section: {
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow:
            "0 2px 8px rgba(0,0,0,0.05)"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    }
};

export default Dashboard;