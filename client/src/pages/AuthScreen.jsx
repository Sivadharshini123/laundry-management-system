import { useState } from "react";

import Login from "./Login";
import Signup from "./Signup";

function AuthScreen({ onLogin }) {
    const [role, setRole] = useState(null);
    const [customerMode, setCustomerMode] = useState("login");
    const [signupSuccess, setSignupSuccess] = useState(false);

    const handleBack = () => {
        setRole(null);
        setCustomerMode("login");
        setSignupSuccess(false);
    };

    const handleSignupSuccess = () => {
        setSignupSuccess(true);
        setCustomerMode("login");
    };

    if (role === "customer") {

        if (signupSuccess) {
            return (
                <div style={styles.page}>

                    <div style={styles.successCard}>

                        <div style={styles.successIcon}>
                            ✓
                        </div>

                        <div style={styles.successLogo}>
                            Laundry<span>Care</span>
                        </div>

                        <h1>
                            Account Created!
                        </h1>

                        <p style={styles.successText}>
                            Your customer account has been
                            created successfully.
                        </p>

                        <p style={styles.loginMessage}>
                            Please sign in using the email
                            and password you just created.
                        </p>

                        <button
                            onClick={() => {
                                setSignupSuccess(false);
                                setCustomerMode("login");
                            }}
                            style={styles.primaryButton}
                        >
                            Sign In
                        </button>

                    </div>

                </div>
            );
        }

        if (customerMode === "signup") {
            return (
                <Signup
                    onSignup={handleSignupSuccess}
                    onBackToLogin={() => {
                        setCustomerMode("login");
                    }}
                />
            );
        }

        return (
            <Login
                onLogin={onLogin}
                selectedRole="customer"
                onBack={handleBack}
                onSignup={() => {
                    setCustomerMode("signup");
                }}
            />
        );
    }

    if (role === "admin") {
        return (
            <Login
                onLogin={onLogin}
                selectedRole="admin"
                onBack={handleBack}
            />
        );
    }

    return (
        <div style={styles.page}>

            <div style={styles.container}>

                <div style={styles.logo}>
                    Laundry<span>Care</span>
                </div>

                <p style={styles.tag}>
                    PROFESSIONAL LAUNDRY CARE
                </p>

                <h1>
                    Welcome to LaundryCare
                </h1>

                <p style={styles.subtitle}>
                    How would you like to continue?
                </p>

                <div style={styles.cards}>

                    <button
                        onClick={() => {
                            setRole("customer");
                        }}
                        style={styles.card}
                    >
                        <div style={styles.icon}>
                            🧺
                        </div>

                        <h2>
                            Customer
                        </h2>

                        <p>
                            Book laundry services,
                            track orders and manage
                            your payments.
                        </p>

                        <span style={styles.continue}>
                            Continue →
                        </span>
                    </button>

                    <button
                        onClick={() => {
                            setRole("admin");
                        }}
                        style={styles.card}
                    >
                        <div style={styles.icon}>
                            ⚙️
                        </div>

                        <h2>
                            Admin
                        </h2>

                        <p>
                            Manage customers,
                            orders, services,
                            machines and payments.
                        </p>

                        <span style={styles.continue}>
                            Admin Sign In →
                        </span>
                    </button>

                </div>

                <p style={styles.footer}>
                    Secure laundry management
                </p>

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

    container: {
        width: "100%",
        maxWidth: "850px",
        textAlign: "center"
    },

    logo: {
        fontSize: "32px",
        fontWeight: "800",
        color: "#111827",
        marginBottom: "45px"
    },

    successLogo: {
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
        marginBottom: "12px"
    },

    subtitle: {
        color: "#6b7280",
        fontSize: "17px",
        marginBottom: "40px"
    },

    cards: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "25px",
        textAlign: "left"
    },

    card: {
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "35px",
        cursor: "pointer",
        textAlign: "left",
        boxShadow:
            "0 8px 25px rgba(0,0,0,0.05)"
    },

    icon: {
        fontSize: "42px",
        marginBottom: "20px"
    },

    continue: {
        display: "inline-block",
        marginTop: "15px",
        fontWeight: "700",
        color: "#111827"
    },

    successCard: {
        width: "100%",
        maxWidth: "450px",
        background: "white",
        padding: "45px",
        borderRadius: "18px",
        textAlign: "center",
        boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)",
        boxSizing: "border-box"
    },

    successIcon: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: "#dcfce7",
        color: "#166534",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 20px",
        fontSize: "35px",
        fontWeight: "800"
    },

    successText: {
        color: "#4b5563",
        lineHeight: "1.6",
        marginBottom: "10px"
    },

    loginMessage: {
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: "1.6",
        marginBottom: "25px"
    },

    primaryButton: {
        width: "100%",
        padding: "13px",
        border: "none",
        borderRadius: "8px",
        background: "#111827",
        color: "white",
        fontWeight: "700",
        cursor: "pointer"
    },

    footer: {
        marginTop: "35px",
        color: "#9ca3af",
        fontSize: "13px"
    }
};

export default AuthScreen;