function Dashboard({
    orders = [],
    payments = [],
    services = [],
    onExploreServices,
    onTrackOrder
}) {
    const recentOrder = orders.length > 0
        ? orders[0]
        : null;

    const activeOrders = orders.filter(
        (order) =>
            order.status === "pending" ||
            order.status === "processing"
    ).length;

    return (
        <div style={styles.page}>

            <section style={styles.hero}>
                <div style={styles.heroContent}>

                    <div style={styles.heroText}>
                        <div style={styles.tag}>
                            PROFESSIONAL LAUNDRY CARE
                        </div>

                        <h1 style={styles.heroTitle}>
                            Fresh clothes.
                            <br />
                            <span>Zero hassle.</span>
                        </h1>

                        <p style={styles.heroDescription}>
                            We wash, dry and care for your
                            clothes while you get your time back.
                            Simple, reliable and convenient.
                        </p>

                        <div style={styles.heroButtons}>
                            <button
                                onClick={onExploreServices}
                                style={styles.primaryButton}
                            >
                                Explore Services →
                            </button>

                            <button
                                onClick={onTrackOrder}
                                style={styles.secondaryButton}
                            >
                                Track an Order
                            </button>
                        </div>

                        <div style={styles.trust}>
                            <span>✓ Professional care</span>
                            <span>✓ Easy ordering</span>
                            <span>✓ Order tracking</span>
                        </div>
                    </div>

                    <div style={styles.heroVisual}>
                        <div style={styles.visualCircle}>
                            🧺
                        </div>

                        <div style={styles.floatingCard}>
                            <div style={styles.checkCircle}>
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Laundry made easy
                                </strong>

                                <p>
                                    From pickup to delivery
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <section style={styles.howSection}>

                <div style={styles.sectionHeading}>
                    <div>
                        <p style={styles.sectionTag}>
                            HOW IT WORKS
                        </p>

                        <h2>
                            Laundry without the
                            <br />
                            complicated stuff.
                        </h2>
                    </div>

                    <p style={styles.sectionDescription}>
                        A simple three-step process designed
                        to save you time.
                    </p>
                </div>

                <div style={styles.steps}>

                    <div style={styles.step}>
                        <div style={styles.stepNumber}>
                            01
                        </div>

                        <div style={styles.stepIcon}>
                            🧺
                        </div>

                        <h3>
                            Choose a service
                        </h3>

                        <p>
                            Pick the laundry service that
                            suits your clothes.
                        </p>
                    </div>

                    <div style={styles.step}>
                        <div style={styles.stepNumber}>
                            02
                        </div>

                        <div style={styles.stepIcon}>
                            📦
                        </div>

                        <h3>
                            Place your order
                        </h3>

                        <p>
                            Add your clothes, choose the
                            weight and checkout.
                        </p>
                    </div>

                    <div style={styles.step}>
                        <div style={styles.stepNumber}>
                            03
                        </div>

                        <div style={styles.stepIcon}>
                            ✨
                        </div>

                        <h3>
                            Relax & track
                        </h3>

                        <p>
                            Follow your order while we
                            take care of the rest.
                        </p>
                    </div>

                </div>

            </section>

            <section style={styles.statsSection}>

                <div style={styles.stat}>
                    <strong>
                        {orders.length}
                    </strong>

                    <span>
                        Total Orders
                    </span>
                </div>

                <div style={styles.stat}>
                    <strong>
                        {activeOrders}
                    </strong>

                    <span>
                        Active Orders
                    </span>
                </div>

                <div style={styles.stat}>
                    <strong>
                        {payments.length}
                    </strong>

                    <span>
                        Payments
                    </span>
                </div>

                <div style={styles.stat}>
                    <strong>
                        24/7
                    </strong>

                    <span>
                        Order Tracking
                    </span>
                </div>

            </section>

            {recentOrder && (
                <section style={styles.orderSection}>

                    <div>
                        <p style={styles.sectionTag}>
                            YOUR LATEST ORDER
                        </p>

                        <h2>
                            Order #{recentOrder.order_id}
                        </h2>

                        <p style={styles.muted}>
                            {recentOrder.weight} kg · ₹
                            {recentOrder.total_amount}
                        </p>
                    </div>

                    <div style={styles.orderRight}>
                        <span
                            style={{
                                ...styles.status,
                                ...(recentOrder.status ===
                                "completed"
                                    ? styles.completed
                                    : recentOrder.status ===
                                      "processing"
                                    ? styles.processing
                                    : styles.pending)
                            }}
                        >
                            {recentOrder.status}
                        </span>

                        <button
                            onClick={onTrackOrder}
                            style={styles.trackButton}
                        >
                            Track Order →
                        </button>
                    </div>

                </section>
            )}

            <section style={styles.cta}>

                <div>
                    <p style={styles.ctaTag}>
                        READY WHEN YOU ARE
                    </p>

                    <h2>
                        Give your clothes
                        <br />
                        the care they deserve.
                    </h2>

                    <p>
                        Choose a service and let LaundryCare
                        handle the rest.
                    </p>
                </div>

                <button
                    onClick={onExploreServices}
                    style={styles.ctaButton}
                >
                    Start Your Order →
                </button>

            </section>

        </div>
    );
}

const styles = {
    page: {
        maxWidth: "1400px",
        margin: "0 auto"
    },

    hero: {
        background:
            "linear-gradient(135deg, #111827 0%, #1f2937 60%, #374151 100%)",
        borderRadius: "24px",
        color: "white",
        overflow: "hidden",
        marginBottom: "55px"
    },

    heroContent: {
        minHeight: "480px",
        padding: "65px",
        display: "grid",
        gridTemplateColumns:
            "1.2fr 0.8fr",
        alignItems: "center",
        gap: "40px"
    },

    heroText: {
        maxWidth: "650px"
    },

    tag: {
        fontSize: "12px",
        letterSpacing: "2px",
        fontWeight: "700",
        opacity: 0.65,
        marginBottom: "18px"
    },

    heroTitle: {
        fontSize: "64px",
        lineHeight: "1.02",
        letterSpacing: "-2px",
        margin: "0 0 25px",
        fontWeight: "800"
    },

    heroTitleSpan: {
        opacity: 0.7
    },

    heroDescription: {
        fontSize: "18px",
        lineHeight: "1.7",
        opacity: 0.75,
        maxWidth: "560px",
        marginBottom: "30px"
    },

    heroButtons: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap"
    },

    primaryButton: {
        border: "none",
        background: "white",
        color: "#111827",
        padding: "14px 22px",
        borderRadius: "9px",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "14px"
    },

    secondaryButton: {
        border: "1px solid rgba(255,255,255,0.3)",
        background: "transparent",
        color: "white",
        padding: "14px 22px",
        borderRadius: "9px",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "14px"
    },

    trust: {
        display: "flex",
        gap: "20px",
        marginTop: "30px",
        flexWrap: "wrap",
        fontSize: "12px",
        opacity: 0.65
    },

    heroVisual: {
        position: "relative",
        minHeight: "320px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    visualCircle: {
        width: "260px",
        height: "260px",
        borderRadius: "50%",
        background:
            "rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "110px"
    },

    floatingCard: {
        position: "absolute",
        right: "0",
        bottom: "20px",
        background: "white",
        color: "#111827",
        padding: "16px",
        borderRadius: "12px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        boxShadow:
            "0 15px 35px rgba(0,0,0,0.25)",
        minWidth: "220px"
    },

    checkCircle: {
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background: "#dcfce7",
        color: "#166534",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800"
    },

    howSection: {
        marginBottom: "50px"
    },

    sectionHeading: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        gap: "30px",
        marginBottom: "30px"
    },

    sectionTag: {
        fontSize: "11px",
        letterSpacing: "2px",
        fontWeight: "700",
        color: "#6b7280",
        marginBottom: "8px"
    },

    sectionDescription: {
        color: "#6b7280",
        maxWidth: "350px",
        lineHeight: "1.6"
    },

    steps: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, 1fr)",
        gap: "20px"
    },

    step: {
        background: "white",
        padding: "28px",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        position: "relative"
    },

    stepNumber: {
        position: "absolute",
        right: "20px",
        top: "20px",
        fontSize: "12px",
        fontWeight: "700",
        color: "#9ca3af"
    },

    stepIcon: {
        fontSize: "35px",
        marginBottom: "18px"
    },

    stepText: {
        color: "#6b7280",
        lineHeight: "1.6"
    },

    statsSection: {
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        display: "grid",
        gridTemplateColumns:
            "repeat(4, 1fr)",
        marginBottom: "30px"
    },

    stat: {
        padding: "25px",
        textAlign: "center",
        borderRight:
            "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: "5px"
    },

    statValue: {
        fontSize: "28px",
        fontWeight: "800"
    },

    statLabel: {
        fontSize: "13px",
        color: "#6b7280"
    },

    orderSection: {
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        padding: "25px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "30px"
    },

    muted: {
        color: "#6b7280"
    },

    orderRight: {
        display: "flex",
        alignItems: "center",
        gap: "15px"
    },

    status: {
        padding: "7px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700",
        textTransform: "capitalize"
    },

    completed: {
        background: "#dcfce7",
        color: "#166534"
    },

    processing: {
        background: "#dbeafe",
        color: "#1d4ed8"
    },

    pending: {
        background: "#fef3c7",
        color: "#92400e"
    },

    trackButton: {
        border: "none",
        background: "#111827",
        color: "white",
        padding: "11px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
    },

    cta: {
        background: "#e5e7eb",
        borderRadius: "20px",
        padding: "45px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "30px",
        marginBottom: "30px"
    },

    ctaTag: {
        fontSize: "11px",
        letterSpacing: "2px",
        fontWeight: "700",
        color: "#6b7280"
    },

    ctaButton: {
        border: "none",
        background: "#111827",
        color: "white",
        padding: "15px 22px",
        borderRadius: "9px",
        fontWeight: "700",
        cursor: "pointer",
        whiteSpace: "nowrap"
    }
};

export default Dashboard;