import StatusBadge from "../../components/StatusBadge";

function Orders({ orders }) {
    return (
        <div style={styles.section}>
            <h2>All Orders</h2>

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Machine</th>
                                <th>Weight</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.order_id}>
                                    <td>
                                        #{order.order_id}
                                    </td>

                                    <td>
                                        #{order.customer_id}
                                    </td>

                                    <td>
                                        #{order.machine_id}
                                    </td>

                                    <td>
                                        {order.weight} kg
                                    </td>

                                    <td>
                                        ₹{order.total_amount}
                                    </td>

                                    <td>
                                        <StatusBadge
                                            status={order.status}
                                        />
                                    </td>

                                    <td>
                                        {new Date(
                                            order.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    section: {
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow:
            "0 2px 8px rgba(0,0,0,0.05)"
    },

    tableWrapper: {
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    }
};

export default Orders;