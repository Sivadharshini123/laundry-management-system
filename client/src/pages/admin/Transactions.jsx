import StatusBadge from "../../components/StatusBadge";

function Transactions({ transactions }) {
    return (
        <div style={styles.section}>
            <h2>Transactions</h2>

            {transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Payment ID</th>
                                <th>Type</th>
                                <th>Reference</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.map((transaction) => (
                                <tr
                                    key={transaction.transaction_id}
                                >
                                    <td>
                                        #{transaction.transaction_id}
                                    </td>

                                    <td>
                                        #{transaction.payment_id}
                                    </td>

                                    <td>
                                        {transaction.transaction_type}
                                    </td>

                                    <td>
                                        {transaction.transaction_ref || "N/A"}
                                    </td>

                                    <td>
                                        ₹{transaction.amount}
                                    </td>

                                    <td>
                                        <StatusBadge
                                            status={transaction.status}
                                        />
                                    </td>

                                    <td>
                                        {new Date(
                                            transaction.transaction_date
                                        ).toLocaleDateString()}
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
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },

    tableWrapper: {
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    }
};

export default Transactions;