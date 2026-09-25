function Header({ title, user, profile }) {
    const displayName =
        profile?.name || user?.email || "User";

    return (
        <header style={styles.header}>
            <div>
                <h1 style={styles.heading}>
                    {title}
                </h1>

                <p style={styles.subHeading}>
                    Welcome back, {displayName}
                </p>
            </div>

            <div style={styles.userBox}>
                <div style={styles.avatar}>
                    {displayName.charAt(0).toUpperCase()}
                </div>

                <span>{displayName}</span>
            </div>
        </header>
    );
}

const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
    },

    heading: {
        margin: 0
    },

    subHeading: {
        color: "#6b7280"
    },

    userBox: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
};

export default Header;