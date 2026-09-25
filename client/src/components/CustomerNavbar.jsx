function CustomerNavbar({
    activePage,
    setActivePage,
    onLogout,
    cartCount,
    profile
}) {
    const displayName =
        profile?.name || "Customer";

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>

                <button
                    onClick={() =>
                        setActivePage("dashboard")
                    }
                    style={styles.logo}
                >
                    Laundry<span>Care</span>
                </button>

                <div style={styles.links}>
                    <button
                        onClick={() =>
                            setActivePage("dashboard")
                        }
                        style={{
                            ...styles.link,
                            ...(activePage === "dashboard"
                                ? styles.activeLink
                                : {})
                        }}
                    >
                        Home
                    </button>

                    <button
                        onClick={() =>
                            setActivePage("services")
                        }
                        style={{
                            ...styles.link,
                            ...(activePage === "services"
                                ? styles.activeLink
                                : {})
                        }}
                    >
                        Services
                    </button>

                    <button
                        onClick={() =>
                            setActivePage("track")
                        }
                        style={{
                            ...styles.link,
                            ...(activePage === "track"
                                ? styles.activeLink
                                : {})
                        }}
                    >
                        Track Order
                    </button>

                    <button
                        onClick={() =>
                            setActivePage("orders")
                        }
                        style={{
                            ...styles.link,
                            ...(activePage === "orders"
                                ? styles.activeLink
                                : {})
                        }}
                    >
                        My Orders
                    </button>
                </div>

                <div style={styles.actions}>

                    <button
                        onClick={() =>
                            setActivePage("cart")
                        }
                        style={styles.cartButton}
                    >
                        🛒

                        {cartCount > 0 && (
                            <span style={styles.badge}>
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() =>
                            setActivePage("profile")
                        }
                        style={styles.profileButton}
                    >
                        <span style={styles.avatar}>
                            {displayName
                                .charAt(0)
                                .toUpperCase()}
                        </span>

                        <span>
                            {displayName}
                        </span>
                    </button>

                    <button
                        onClick={onLogout}
                        style={styles.logout}
                    >
                        Logout
                    </button>

                </div>

            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "white",
        borderBottom:
            "1px solid #e5e7eb"
    },

    container: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "16px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "30px"
    },

    logo: {
        border: "none",
        background: "transparent",
        fontSize: "24px",
        fontWeight: "800",
        color: "#111827",
        cursor: "pointer",
        padding: 0
    },

    links: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flex: 1
    },

    link: {
        border: "none",
        background: "transparent",
        padding: "10px 14px",
        borderRadius: "8px",
        color: "#4b5563",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500"
    },

    activeLink: {
        color: "#111827",
        background: "#f3f4f6",
        fontWeight: "700"
    },

    actions: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    cartButton: {
        position: "relative",
        width: "42px",
        height: "42px",
        border: "1px solid #e5e7eb",
        background: "white",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "18px"
    },

    badge: {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        background: "#111827",
        color: "white",
        width: "19px",
        height: "19px",
        borderRadius: "50%",
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700"
    },

    profileButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontWeight: "600",
        color: "#374151"
    },

    avatar: {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        background: "#111827",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px"
    },

    logout: {
        border: "1px solid #d1d5db",
        background: "white",
        padding: "9px 14px",
        borderRadius: "8px",
        cursor: "pointer",
        color: "#374151",
        fontWeight: "600"
    }
};

export default CustomerNavbar;