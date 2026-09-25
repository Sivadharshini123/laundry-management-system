function Machines({ machines }) {
    return (
        <div style={styles.section}>
            <h2>Machines</h2>

            {machines.length === 0 ? (
                <p>No machines found.</p>
            ) : (
                <div style={styles.grid}>
                    {machines.map((machine) => (
                        <div
                            key={machine.machine_id}
                            style={styles.card}
                        >
                            <h3>
                                {machine.machine_name}
                            </h3>

                            <p>
                                Type: {machine.machine_type}
                            </p>

                            <p>
                                Capacity: {machine.capacity} kg
                            </p>

                            <span
                                style={{
                                    ...styles.status,
                                    ...getStatusStyle(
                                        machine.status
                                    )
                                }}
                            >
                                {machine.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function getStatusStyle(status) {
    const styles = {
        available: {
            background: "#dcfce7",
            color: "#166534"
        },

        running: {
            background: "#dbeafe",
            color: "#1e40af"
        },

        maintenance: {
            background: "#fef3c7",
            color: "#92400e"
        },

        inactive: {
            background: "#fee2e2",
            color: "#991b1b"
        }
    };

    return (
        styles[status] || {
            background: "#e5e7eb",
            color: "#374151"
        }
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

    status: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "600",
        textTransform: "capitalize"
    }
};

export default Machines;