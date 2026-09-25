function OrderSuccess({ order, onTrackOrder }) {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.icon}>
                    ✓
                </div>

                <h1>Order Confirmed!</h1>

                <p style={styles.message}>
                    Your laundry order has been placed
                    successfully.
                </p>

                {order && (
                    <div style={styles.orderBox}>
                        <div>
                            <span>Order ID</span>

                            <strong>
                                #{order.order_id}
                            </strong>
                        </div>

                        <div>
                            <span>Weight</span>

                            <strong>
                                {order.weight} kg
                            </strong>
                        </div>

                        <div>
                            <span>Total</span>

                            <strong>
                                ₹{order.total_amount}
                            </strong>
                        </div>

                        <div>
                            <span>Status</span>

                            <strong>
                                {order.status}
                            </strong>
                        </div>
                    </div>
                )}

                <button
                    onClick={onTrackOrder}
                    style={styles.button}
                >
                    Track My Order
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh"
    },

    card: {
        background: "white",
        padding: "45px",
        borderRadius: "18px",
        textAlign: "center",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 5px 20px rgba(0,0,0,0.06)"
    },

    icon: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: "#dcfce7",
        color: "#166534",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        fontSize: "35px",
        fontWeight: "bold"
    },

    message: {
        color: "#6b7280"
    },

    orderBox: {
        margin: "25px 0",
        padding: "20px",
        background: "#f9fafb",
        borderRadius: "12px"
    },

    button: {
        width: "100%",
        padding: "14px",
        border: "none",
        borderRadius: "9px",
        background: "#111827",
        color: "white",
        fontWeight: "600",
        cursor: "pointer"
    }
};

export default OrderSuccess;