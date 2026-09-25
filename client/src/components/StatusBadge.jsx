function StatusBadge({ status }) {
    const statusStyles = {
        pending: {
            background: "#fef3c7",
            color: "#92400e"
        },

        processing: {
            background: "#dbeafe",
            color: "#1e40af"
        },

        completed: {
            background: "#dcfce7",
            color: "#166534"
        },

        cancelled: {
            background: "#fee2e2",
            color: "#991b1b"
        },

        paid: {
            background: "#dcfce7",
            color: "#166534"
        },

        failed: {
            background: "#fee2e2",
            color: "#991b1b"
        }
    };

    const currentStyle =
        statusStyles[status] || {
            background: "#e5e7eb",
            color: "#374151"
        };

    return (
        <span
            style={{
                ...styles.badge,
                ...currentStyle
            }}
        >
            {status}
        </span>
    );
}

const styles = {
    badge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "600",
        textTransform: "capitalize"
    }
};

export default StatusBadge;