function Profile({ profile }) {
    if (!profile) {
        return <p>Loading profile...</p>;
    }

    return (
        <div style={styles.card}>
            <h2>My Profile</h2>

            <div style={styles.row}>
                <strong>Name</strong>
                <span>{profile.name}</span>
            </div>

            <div style={styles.row}>
                <strong>Phone</strong>
                <span>{profile.phone}</span>
            </div>

            <div style={styles.row}>
                <strong>Email</strong>
                <span>{profile.email}</span>
            </div>

            <div style={styles.row}>
                <strong>Address</strong>
                <span>
                    {profile.address || "Not provided"}
                </span>
            </div>
        </div>
    );
}

const styles = {
    card: {
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        maxWidth: "700px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },

    row: {
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        padding: "18px 0",
        borderBottom: "1px solid #eee"
    }
};

export default Profile;