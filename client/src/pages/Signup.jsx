import { useState } from "react";

function Signup({ onSignup, onBackToLogin }) {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        address: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (
            !form.name ||
            !form.phone ||
            !form.email ||
            !form.password ||
            !form.address
        ) {
            setError("Please fill all fields");
            return;
        }

        if (form.password.length < 6) {
            setError(
                "Password must be at least 6 characters"
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Registration failed"
                );
            }

            onSignup();

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <div style={styles.card}>

                <button
                    onClick={onBackToLogin}
                    style={styles.backButton}
                >
                    ← Back to Sign In
                </button>

                <div style={styles.logo}>
                    Laundry<span>Care</span>
                </div>

                <p style={styles.tag}>
                    CUSTOMER ACCOUNT
                </p>

                <h1>
                    Create your account
                </h1>

                <p style={styles.subtitle}>
                    Join LaundryCare and make laundry
                    simpler.
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label style={styles.label}>
                        Full Name
                    </label>

                    <input
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <label style={styles.label}>
                        Phone Number
                    </label>

                    <input
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <label style={styles.label}>
                        Email
                    </label>

                    <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <label style={styles.label}>
                        Password
                    </label>

                    <input
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={form.password}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <label style={styles.label}>
                        Address
                    </label>

                    <textarea
                        name="address"
                        placeholder="Enter your address"
                        value={form.address}
                        onChange={handleChange}
                        style={styles.textarea}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <div style={styles.loginText}>
                    Already have an account?
                </div>

                <button
                    onClick={onBackToLogin}
                    style={styles.loginButton}
                >
                    Sign In
                </button>

            </div>

        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        boxSizing: "border-box"
    },

    card: {
        width: "100%",
        maxWidth: "480px",
        background: "white",
        padding: "40px",
        borderRadius: "18px",
        boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)",
        boxSizing: "border-box"
    },

    backButton: {
        border: "none",
        background: "transparent",
        color: "#6b7280",
        cursor: "pointer",
        padding: 0,
        fontSize: "14px",
        marginBottom: "25px"
    },

    logo: {
        fontSize: "26px",
        fontWeight: "800",
        color: "#111827",
        marginBottom: "25px"
    },

    tag: {
        fontSize: "11px",
        letterSpacing: "2px",
        fontWeight: "700",
        color: "#6b7280",
        marginBottom: "8px"
    },

    subtitle: {
        color: "#6b7280",
        marginBottom: "25px",
        lineHeight: "1.5"
    },

    label: {
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "7px",
        marginTop: "15px"
    },

    input: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        boxSizing: "border-box",
        fontSize: "14px",
        outline: "none"
    },

    textarea: {
        width: "100%",
        minHeight: "80px",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        boxSizing: "border-box",
        fontSize: "14px",
        resize: "vertical"
    },

    button: {
        width: "100%",
        marginTop: "25px",
        padding: "13px",
        border: "none",
        borderRadius: "8px",
        background: "#111827",
        color: "white",
        fontWeight: "700",
        cursor: "pointer"
    },

    loginText: {
        textAlign: "center",
        marginTop: "25px",
        color: "#6b7280",
        fontSize: "14px"
    },

    loginButton: {
        width: "100%",
        marginTop: "10px",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        background: "white",
        color: "#111827",
        fontWeight: "600",
        cursor: "pointer"
    },

    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "10px 12px",
        borderRadius: "8px",
        marginBottom: "15px",
        fontSize: "14px"
    }
};

export default Signup;