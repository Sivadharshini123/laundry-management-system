function Cart({ cart, onUpdateWeight, onRemove, onCheckout }) {
    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price_per_kg) *
            Number(item.weight),
        0
    );

    return (
        <div>
            <h1>Shopping Cart</h1>

            {cart.length === 0 ? (
                <div style={styles.empty}>
                    <div style={styles.icon}>🛒</div>

                    <h2>Your cart is empty</h2>

                    <p>
                        Add a laundry service to get started.
                    </p>
                </div>
            ) : (
                <div style={styles.layout}>
                    <div style={styles.items}>
                        {cart.map((item) => (
                            <div
                                key={item.service_id}
                                style={styles.item}
                            >
                                <div style={styles.itemIcon}>
                                    🧺
                                </div>

                                <div style={styles.info}>
                                    <h3>
                                        {item.service_name}
                                    </h3>

                                    <p>
                                        ₹{item.price_per_kg} / kg
                                    </p>

                                    <label>
                                        Weight
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="0.5"
                                        value={item.weight}
                                        onChange={(event) =>
                                            onUpdateWeight(
                                                item.service_id,
                                                event.target.value
                                            )
                                        }
                                        style={styles.input}
                                    />

                                    <button
                                        onClick={() =>
                                            onRemove(
                                                item.service_id
                                            )
                                        }
                                        style={styles.remove}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <strong style={styles.subtotal}>
                                    ₹
                                    {(
                                        Number(
                                            item.price_per_kg
                                        ) *
                                        Number(item.weight)
                                    ).toFixed(2)}
                                </strong>
                            </div>
                        ))}
                    </div>

                    <div style={styles.summary}>
                        <h2>Order Summary</h2>

                        <div style={styles.line}>
                            <span>Services</span>
                            <span>{cart.length}</span>
                        </div>

                        <div style={styles.line}>
                            <span>Total Weight</span>

                            <span>
                                {cart.reduce(
                                    (sum, item) =>
                                        sum +
                                        Number(item.weight),
                                    0
                                )}{" "}
                                kg
                            </span>
                        </div>

                        <hr />

                        <div style={styles.total}>
                            <span>Total</span>
                            <strong>
                                ₹{total.toFixed(2)}
                            </strong>
                        </div>

                        <button
                            onClick={onCheckout}
                            style={styles.checkout}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
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

    items: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },

    item: {
        background: "white",
        padding: "22px",
        borderRadius: "14px",
        display: "flex",
        gap: "18px",
        alignItems: "flex-start",
        boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
    },

    itemIcon: {
        fontSize: "35px"
    },

    info: {
        flex: 1
    },

    infoTitle: {
        margin: 0
    },

    input: {
        display: "block",
        width: "100px",
        padding: "9px",
        marginTop: "7px",
        border: "1px solid #d1d5db",
        borderRadius: "7px"
    },

    remove: {
        marginTop: "12px",
        border: "none",
        background: "transparent",
        color: "#dc2626",
        cursor: "pointer",
        padding: 0
    },

    subtotal: {
        fontSize: "18px"
    },

    summary: {
        background: "white",
        padding: "25px",
        borderRadius: "14px",
        height: "fit-content",
        boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
    },

    line: {
        display: "flex",
        justifyContent: "space-between",
        margin: "15px 0",
        color: "#6b7280"
    },

    total: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "20px",
        margin: "20px 0"
    },

    checkout: {
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
        textAlign: "center",
        padding: "70px 20px",
        borderRadius: "16px"
    },

    icon: {
        fontSize: "50px"
    }
};

export default Cart;