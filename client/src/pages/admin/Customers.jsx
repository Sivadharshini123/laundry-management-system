function Customers({ customers, onRefresh }) {
    return (
        <div style={styles.section}>
            <div style={styles.header}>
                <h2>Customers</h2>

                <button
                    onClick={onRefresh}
                    style={styles.button}
                >
                    Refresh
                </button>
            </div>

            {customers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((customer) => (
                                <tr
                                    key={customer.customer_id}
                                >
                                    <td>
                                        #{customer.customer_id}
                                    </td>

                                    <td>
                                        {customer.name}
                                    </td>

                                    <td>
                                        {customer.phone}
                                    </td>

                                    <td>
                                        {customer.email}
                                    </td>

                                    <td>
                                        {customer.address ||
                                            "Not provided"}
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

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },

    button: {
        padding: "10px 18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        background: "#1f2937",
        color: "white"
    },

    tableWrapper: {
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    }
};

export default Customers;