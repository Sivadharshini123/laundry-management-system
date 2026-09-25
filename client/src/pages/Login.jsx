import { useState } from "react";

function Login({
    onLogin,
    selectedRole,
    onBack,
    onSignup
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isCustomer =
        selectedRole === "customer";

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError(
                "Email and password are required"
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Login failed"
                );
            }

            if (
                selectedRole &&
                data.user.role !== selectedRole
            ) {
                await fetch(
                    "http://localhost:5000/api/auth/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

                throw new Error(
                    `This account is not registered as a ${selectedRole}.`
                );
            }

            onLogin(data.user);

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <div style={styles.card}>

                <button
                    onClick={onBack}
                    style={styles.backButton}
                >
                    ← Back
                </button>

                <div style={styles.logo}>
                    Laundry<span>Care</span>
                </div>

                <div style={styles.icon}>
                    {isCustomer ? "🧺" : "⚙️"}
                </div>

                <p style={styles.tag}>
                    {isCustomer
                        ? "CUSTOMER PORTAL"
                        : "ADMIN PORTAL"}
                </p>

                <h1>
                    {isCustomer
                        ? "Welcome back"
                        : "Admin Sign In"}
                </h1>

                <p style={styles.subtitle}>
                    {isCustomer
                        ? "Sign in to manage your laundry orders."
                        : "Sign in to manage LaundryCare."}
                </p>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label style={styles.label}>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        style={styles.input}
                    />

                    <label style={styles.label}>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        style={styles.input}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.loginButton}
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In"}
                    </button>

                </form>

                {isCustomer && (
                    <>
                        <div style={styles.divider}>
                            <span></span>
                            <p>OR</p>
                            <span></span>
                        </div>

                        <button
                            onClick={onSignup}
                            style={styles.signupButton}
                        >
                            Create Customer Account
                        </button>
                    </>
                )}

            </div>

        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        boxSizing: "border-box"
    },

    card: {
        width: "100%",
        maxWidth: "440px",
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

    icon: {
        fontSize: "38px",
        marginBottom: "12px"
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
        lineHeight: "1.5",
        marginBottom: "25px"
    },

    label: {
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "7px",
        marginTop: "16px"
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

    loginButton: {
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

    divider: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "25px 0"
    },

    dividerSpan: {
        flex: 1
    },

    dividerText: {
        color: "#9ca3af",
        fontSize: "12px"
    },

    signupButton: {
        width: "100%",
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

export default Login;