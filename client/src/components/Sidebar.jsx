function Sidebar({
    activePage,
    setActivePage,
    onLogout,
    role,
    cartCount
}) {
    const customerLinks = [
        ["dashboard", "Home"],
        ["services", "Services"],
        ["orders", "My Orders"],
        ["track", "Track Order"],
        ["payments", "Payments"],
        ["profile", "Profile"]
    ];

    const adminLinks = [
        ["dashboard", "Dashboard"],
        ["customers", "Customers"],
        ["orders", "Orders"],
        ["services", "Services"],
        ["machines", "Machines"],
        ["payments", "Payments"],
        ["transactions", "Transactions"]
    ];

    const links =
        role === "admin"
            ? adminLinks
            : customerLinks;

    return (
        <aside style={styles.sidebar}>
            <h2 style={styles.logo}>
                Laundry<span>Care</span>
            </h2>

            <nav>
                {links.map(([page, label]) => (
                    <button
                        key={page}
                        onClick={() =>
                            setActivePage(page)
                        }
                        style={{
                            ...styles.navButton,
                            ...(activePage === page
                                ? styles.activeButton
                                : {})
                        }}
                    >
                        {label}
                    </button>
                ))}

                {role === "customer" && (
                    <button
                        onClick={() =>
                            setActivePage("cart")
                        }
                        style={{
                            ...styles.navButton,
                            ...(activePage === "cart"
                                ? styles.activeButton
                                : {})
                        }}
                    >
                        🛒 Cart
                        {cartCount > 0 && (
                            <span
                                style={styles.cartBadge}
                            >
                                {cartCount}
                            </span>
                        )}
                    </button>
                )}
            </nav>

            <button
                onClick={onLogout}
                style={styles.logoutButton}
            >
                Logout
            </button>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: "240px",
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "25px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
    },

    logo: {
        marginBottom: "40px",
        fontSize: "24px"
    },

    navButton: {
        display: "block",
        width: "100%",
        padding: "13px",
        marginBottom: "10px",
        border: "none",
        borderRadius: "8px",
        background: "transparent",
        color: "white",
        textAlign: "left",
        cursor: "pointer",
        fontSize: "15px"
    },

    activeButton: {
        background: "#374151"
    },

    cartBadge: {
        float: "right",
        background: "white",
        color: "#111827",
        borderRadius: "20px",
        minWidth: "22px",
        height: "22px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold"
    },

    logoutButton: {
        marginTop: "auto",
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        background: "white",
        color: "#111827",
        fontWeight: "600"
    }
};

export default Sidebar;