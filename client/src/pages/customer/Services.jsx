function Services({ services, onAddToCart }) {
    return (
        <div>
            <div style={styles.hero}>
                <div>
                    <p style={styles.smallTitle}>
                        LAUNDRYCARE SERVICES
                    </p>

                    <h1 style={styles.heroTitle}>
                        Fresh clothes,
                        <br />
                        zero hassle.
                    </h1>

                    <p style={styles.heroText}>
                        Professional laundry and garment care
                        delivered with convenience and care.
                    </p>
                </div>
            </div>

            <div style={styles.section}>
                <h2>Choose a Service</h2>

                <p style={styles.description}>
                    Select the laundry service you need and add it
                    to your cart.
                </p>

                <div style={styles.grid}>
                    {services.map((service) => (
                        <div
                            key={service.service_id}
                            style={styles.card}
                        >
                            <div style={styles.icon}>
                                🧺
                            </div>

                            <h3>
                                {service.service_name}
                            </h3>

                            <p style={styles.serviceDescription}>
                                {service.description ||
                                    "Professional care for your clothes."}
                            </p>

                            <div style={styles.bottom}>
                                <div>
                                    <span style={styles.price}>
                                        ₹{service.price_per_kg}
                                    </span>

                                    <span style={styles.perKg}>
                                        / kg
                                    </span>
                                </div>

                                <button
                                    onClick={() =>
                                        onAddToCart(service)
                                    }
                                    style={styles.button}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {services.length === 0 && (
                    <div style={styles.empty}>
                        No services available right now.
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    hero: {
        background:
            "linear-gradient(135deg, #111827, #374151)",
        color: "white",
        padding: "45px",
        borderRadius: "18px",
        marginBottom: "30px"
    },

    smallTitle: {
        fontSize: "13px",
        letterSpacing: "2px",
        marginBottom: "12px",
        opacity: 0.8
    },

    heroTitle: {
        fontSize: "42px",
        lineHeight: "1.1",
        margin: "0 0 15px"
    },

    heroText: {
        fontSize: "16px",
        maxWidth: "500px",
        opacity: 0.85
    },

    section: {
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
    },

    description: {
        color: "#6b7280",
        marginBottom: "25px"
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px"
    },

    card: {
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "22px",
        transition: "0.2s"
    },

    icon: {
        fontSize: "35px",
        marginBottom: "12px"
    },

    serviceDescription: {
        color: "#6b7280",
        minHeight: "45px",
        lineHeight: "1.5"
    },

    bottom: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        gap: "10px"
    },

    price: {
        fontSize: "22px",
        fontWeight: "700"
    },

    perKg: {
        color: "#6b7280",
        fontSize: "14px"
    },

    button: {
        border: "none",
        background: "#111827",
        color: "white",
        padding: "11px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
    },

    empty: {
        padding: "40px",
        textAlign: "center",
        color: "#6b7280"
    }
};

export default Services;