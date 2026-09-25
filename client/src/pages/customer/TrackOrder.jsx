import StatusBadge from "../../components/StatusBadge";

function TrackOrder({ orders }) {
    return (
        <div style={styles.section}>
            <h2>Track Your Orders</h2>

            {orders.length === 0 ? (
                <p>No orders to track.</p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order.order_id}
                        style={styles.orderCard}
                    >
                        <div>
                            <h3>
                                Order #{order.order_id}
                            </h3>

                            <p>
                                Weight: {order.weight} kg
                            </p>

                            <p>
                                Amount: ₹{order.total_amount}
                            </p>

                            <p>
                                Created:{" "}
                                {new Date(
                                    order.created_at
                                ).toLocaleDateString()}
                            </p>
                        </div>

                        <StatusBadge
                            status={order.status}
                        />
                    </div>
                ))
            )}
        </div>
    );
}

const styles = {
    section: {
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },

    orderCard: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        marginBottom: "15px",
        border: "1px solid #eee",
        borderRadius: "10px"
    }
};

export default TrackOrder;