function Checkout({
    cart,
    profile,
    onPlaceOrder,
    loading
}) {
    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price_per_kg) *
            Number(item.weight),
        0
    );

    if (cart.length === 0) {
        return (
            <div style={styles.empty}>
                <h2>Your cart is empty</h2>
                <p>Add a service before checking out.</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Checkout</h1>

            <div style={styles.layout}>
                <div>
                    <div style={styles.card}>
                        <h2>Pickup Details</h2>

                        <div style={styles.detail}>
                            <strong>Name</strong>
                            <span>
                                {profile?.name || "Customer"}
                            </span>
                        </div>

                        <div style={styles.detail}>
                            <strong>Phone</strong>
                            <span>
                                {profile?.phone || "Not available"}
                            </span>
                        </div>

                        <div style={styles.detail}>
                            <strong>Address</strong>
                            <span>
                                {profile?.address ||
                                    "Address not provided"}
                            </span>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h2>Payment Method</h2>

                        <div style={styles.payment}>
                            <span>💳</span>

                            <div>
                                <strong>
                                    Cash on Delivery
                                </strong>

                                <p>
                                    Pay when your laundry is
                                    completed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.summary}>
                    <h2>Order Summary</h2>

                    {cart.map((item) => (
                        <div
                            key={item.service_id}
                            style={styles.item}
                        >
                            <div>
                                <strong>
                                    {item.service_name}
                                </strong>

                                <p>
                                    {item.weight} kg × ₹
                                    {item.price_per_kg}
                                </p>
                            </div>

                            <strong>
                                ₹
                                {(
                                    Number(item.price_per_kg) *
                                    Number(item.weight)
                                ).toFixed(2)}
                            </strong>
                        </div>
                    ))}

                    <hr />

                    <div style={styles.total}>
                        <span>Total</span>

                        <strong>
                            ₹{total.toFixed(2)}
                        </strong>
                    </div>

                    <button
                        onClick={onPlaceOrder}
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading
                            ? "Placing Order..."
                            : `Place Order • ₹${total.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    layout: {
        display: "grid",
        gridTemplateColumns:
            "minmax(0, 2fr) minmax(280px, 1fr)",
        gap: "25px"
    },

    card: {
        background: "white",
        padding: "25px",
        borderRadius: "14px",
        marginBottom: "20px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
    },

    detail: {
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        padding: "15px 0",
        borderBottom: "1px solid #eee"
    },

    payment: {
        display: "flex",
        gap: "15px",
        alignItems: "center",
        padding: "18px",
        border: "1px solid #d1d5db",
        borderRadius: "10px"
    },

    item: {
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        padding: "12px 0"
    },

    summary: {
        background: "white",
        padding: "25px",
        borderRadius: "14px",
        height: "fit-content",
        boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
    },

    total: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "20px",
        margin: "20px 0"
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
    },

    empty: {
        background: "white",
        padding: "50px",
        textAlign: "center",
        borderRadius: "14px"
    }
};

export default Checkout;