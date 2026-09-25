import StatusBadge from "../../components/StatusBadge";

function Services({ services }) {
    return (
        <div style={styles.section}>
            <h2>Services</h2>

            {services.length === 0 ? (
                <p>No services found.</p>
            ) : (
                <div style={styles.grid}>
                    {services.map((service) => (
                        <div
                            key={service.service_id}
                            style={styles.card}
                        >
                            <h3>{service.service_name}</h3>

                            <p>
                                {service.description ||
                                    "No description available"}
                            </p>

                            <div style={styles.price}>
                                ₹{service.price_per_kg} / kg
                            </div>
                        </div>
                    ))}
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
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },

    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
    },

    card: {
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px"
    },

    price: {
        fontSize: "20px",
        fontWeight: "bold",
        marginTop: "15px"
    }
};

export default Services;