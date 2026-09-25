function StatCard({ title, value }) {
    return (
        <div style={styles.card}>
            <p style={styles.title}>
                {title}
            </p>

            <h2 style={styles.value}>
                {value}
            </h2>
        </div>
    );
}

const styles = {
    card: {
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },

    title: {
        color: "#6b7280",
        margin: 0
    },

    value: {
        fontSize: "28px",
        marginBottom: 0
    }
};

export default StatCard;