import StatusBadge from "../../components/StatusBadge";

function Payments({ payments }) {
    return (
        <div style={styles.section}>
            <h2>All Payments</h2>

            {payments.length === 0 ? (
                <p>No payments found.</p>
            ) : (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Order ID</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Paid At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((payment) => (
                                <tr
                                    key={payment.payment_id}
                                >
                                    <td>
                                        #{payment.payment_id}
                                    </td>

                                    <td>
                                        #{payment.order_id}
                                    </td>

                                    <td>
                                        ₹{payment.amount}
                                    </td>

                                    <td>
                                        {payment.payment_method}
                                    </td>

                                    <td>
                                        <StatusBadge
                                            status={
                                                payment.payment_status
                                            }
                                        />
                                    </td>

                                    <td>
                                        {payment.paid_at
                                            ? new Date(
                                                payment.paid_at
                                            ).toLocaleDateString()
                                            : "Not paid"}
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

export default Payments;