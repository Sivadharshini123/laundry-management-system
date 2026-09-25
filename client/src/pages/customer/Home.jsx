import { useEffect, useState } from "react";

function Home() {
    const [services, setServices] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/services"
                );

                if (response.ok) {
                    const data = await response.json();
                    setServices(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchServices();
    }, []);

    const goToLogin = () => {
        window.location.href = "/login";
    };

    const goToSignup = () => {
        window.location.href = "/signup";
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);

        if (element) {
            element.scrollIntoView({
                behavior: "smooth"
            });
        }

        setMenuOpen(false);
    };

    return (
        <div style={styles.page}>

            {/* NAVBAR */}

            <nav style={styles.navbar}>

                <div
                    style={styles.logo}
                    onClick={() =>
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        })
                    }
                >
                    <span style={styles.logoIcon}>
                        🧺
                    </span>

                    <span>
                        Laundry
                        <span style={styles.logoAccent}>
                            Care
                        </span>
                    </span>
                </div>

                <div
                    style={{
                        ...styles.navLinks,
                        ...(menuOpen
                            ? styles.mobileNav
                            : {})
                    }}
                >

                    <button
                        onClick={() =>
                            scrollToSection("home")
                        }
                        style={styles.navLink}
                    >
                        Home
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection("services")
                        }
                        style={styles.navLink}
                    >
                        Services
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection("how-it-works")
                        }
                        style={styles.navLink}
                    >
                        How It Works
                    </button>

                    <button
                        onClick={() =>
                            scrollToSection("why-us")
                        }
                        style={styles.navLink}
                    >
                        Why LaundryCare
                    </button>

                    <button
                        onClick={goToLogin}
                        style={styles.mobileLogin}
                    >
                        Login
                    </button>

                    <button
                        onClick={goToSignup}
                        style={styles.mobileSignup}
                    >
                        Get Started
                    </button>

                </div>

                <div style={styles.desktopActions}>

                    <button
                        onClick={goToLogin}
                        style={styles.loginButton}
                    >
                        Login
                    </button>

                    <button
                        onClick={goToSignup}
                        style={styles.getStartedButton}
                    >
                        Get Started
                        <span>→</span>
                    </button>

                </div>

                <button
                    onClick={() =>
                        setMenuOpen(!menuOpen)
                    }
                    style={styles.menuButton}
                >
                    ☰
                </button>

            </nav>


            {/* HERO */}

            <section
                id="home"
                style={styles.hero}
            >

                <div style={styles.heroContent}>

                    <div style={styles.heroBadge}>
                        <span style={styles.badgeDot}></span>
                        PROFESSIONAL LAUNDRY CARE
                    </div>

                    <h1 style={styles.heroTitle}>
                        Fresh clothes.
                        <br />
                        <span style={styles.heroAccent}>
                            Zero hassle.
                        </span>
                    </h1>

                    <p style={styles.heroDescription}>
                        Professional washing, dry cleaning,
                        ironing and garment care — all in
                        one simple place.
                    </p>

                    <div style={styles.heroButtons}>

                        <button
                            onClick={goToSignup}
                            style={styles.heroPrimary}
                        >
                            Start Your Laundry
                            <span>→</span>
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection("services")
                            }
                            style={styles.heroSecondary}
                        >
                            Explore Services
                        </button>

                    </div>

                    <div style={styles.heroTrust}>

                        <div style={styles.trustItem}>
                            <strong>
                                500+
                            </strong>

                            <span>
                                Orders handled
                            </span>
                        </div>

                        <div style={styles.trustDivider}></div>

                        <div style={styles.trustItem}>
                            <strong>
                                4.9/5
                            </strong>

                            <span>
                                Customer rating
                            </span>
                        </div>

                        <div style={styles.trustDivider}></div>

                        <div style={styles.trustItem}>
                            <strong>
                                24–48h
                            </strong>

                            <span>
                                Fast turnaround
                            </span>
                        </div>

                    </div>

                </div>

                <div style={styles.heroVisual}>

                    <div style={styles.blobOne}></div>
                    <div style={styles.blobTwo}></div>

                    <div style={styles.machineCard}>

                        <div style={styles.machineCircle}>
                            🫧
                        </div>

                        <div>
                            <p style={styles.machineSmall}>
                                LAUNDRYCARE
                            </p>

                            <h3 style={styles.machineTitle}>
                                Clean. Fresh.
                                <br />
                                Ready.
                            </h3>
                        </div>

                    </div>

                    <div style={styles.floatingOrder}>

                        <div style={styles.successCircle}>
                            ✓
                        </div>

                        <div>
                            <strong>
                                Fresh laundry
                            </strong>

                            <p>
                                Ready for you
                            </p>
                        </div>

                    </div>

                    <div style={styles.floatingBubble}>
                        ✨
                    </div>

                </div>

            </section>


            {/* QUICK BENEFITS */}

            <section
                id="why-us"
                style={styles.benefitsSection}
            >

                <div style={styles.centerHeader}>

                    <span style={styles.sectionTag}>
                        WHY LAUNDRYCARE
                    </span>

                    <h2 style={styles.sectionTitle}>
                        Laundry care designed
                        around you.
                    </h2>

                    <p style={styles.sectionDescription}>
                        We combine professional garment care
                        with a simple digital experience.
                    </p>

                </div>

                <div style={styles.benefitGrid}>

                    <div style={styles.benefitCard}>

                        <div style={styles.benefitIcon}>
                            🧼
                        </div>

                        <h3>
                            Professional Care
                        </h3>

                        <p>
                            Your clothes receive careful,
                            professional treatment for a
                            fresh and clean finish.
                        </p>

                    </div>

                    <div style={styles.benefitCard}>

                        <div style={styles.benefitIcon}>
                            ⚡
                        </div>

                        <h3>
                            Quick Turnaround
                        </h3>

                        <p>
                            Get your laundry processed
                            efficiently without unnecessary
                            waiting.
                        </p>

                    </div>

                    <div style={styles.benefitCard}>

                        <div style={styles.benefitIcon}>
                            📱
                        </div>

                        <h3>
                            Easy Online Booking
                        </h3>

                        <p>
                            Choose your service, enter your
                            laundry details and place an order
                            in minutes.
                        </p>

                    </div>

                    <div style={styles.benefitCard}>

                        <div style={styles.benefitIcon}>
                            🔒
                        </div>

                        <h3>
                            Secure & Reliable
                        </h3>

                        <p>
                            Your account and order information
                            are protected through secure
                            authentication.
                        </p>

                    </div>

                </div>

            </section>


            {/* SERVICES */}

            <section
                id="services"
                style={styles.servicesSection}
            >

                <div style={styles.sectionHeader}>

                    <div>
                        <span style={styles.sectionTag}>
                            OUR SERVICES
                        </span>

                        <h2 style={styles.sectionTitle}>
                            Everything your clothes need.
                        </h2>

                        <p style={styles.sectionDescription}>
                            From everyday washing to special
                            garment care, choose what works
                            for you.
                        </p>
                    </div>

                    <button
                        onClick={goToSignup}
                        style={styles.outlineButton}
                    >
                        Book a Service →
                    </button>

                </div>

                <div style={styles.serviceGrid}>

                    {services.length > 0 ? (
                        services.map(
                            (service, index) => (

                                <div
                                    key={
                                        service.service_id
                                    }
                                    style={
                                        styles.serviceCard
                                    }
                                >

                                    <div
                                        style={
                                            styles.serviceTop
                                        }
                                    >

                                        <div
                                            style={
                                                styles.serviceIcon
                                            }
                                        >
                                            {index === 0
                                                ? "🧺"
                                                : index === 1
                                                    ? "👔"
                                                    : index === 2
                                                        ? "✨"
                                                        : "🧼"}
                                        </div>

                                        <span
                                            style={
                                                styles.serviceArrow
                                            }
                                        >
                                            ↗
                                        </span>

                                    </div>

                                    <h3>
                                        {
                                            service.service_name
                                        }
                                    </h3>

                                    <p>
                                        {
                                            service.description ||
                                            "Professional care for your clothes."
                                        }
                                    </p>

                                    <div
                                        style={
                                            styles.servicePrice
                                        }
                                    >
                                        ₹
                                        {
                                            service.price_per_kg
                                        }

                                        <span>
                                            / kg
                                        </span>
                                    </div>

                                </div>

                            )
                        )
                    ) : (

                        <>

                            <div style={styles.serviceCard}>
                                <div style={styles.serviceIcon}>
                                    🧺
                                </div>

                                <h3>
                                    Regular Wash
                                </h3>

                                <p>
                                    Everyday washing for
                                    your regular clothes.
                                </p>

                                <div style={styles.servicePrice}>
                                    ₹50
                                    <span>/ kg</span>
                                </div>
                            </div>

                            <div style={styles.serviceCard}>
                                <div style={styles.serviceIcon}>
                                    👔
                                </div>

                                <h3>
                                    Dry Cleaning
                                </h3>

                                <p>
                                    Special care for delicate
                                    and premium garments.
                                </p>

                                <div style={styles.servicePrice}>
                                    ₹120
                                    <span>/ kg</span>
                                </div>
                            </div>

                            <div style={styles.serviceCard}>
                                <div style={styles.serviceIcon}>
                                    ✨
                                </div>

                                <h3>
                                    Ironing
                                </h3>

                                <p>
                                    Crisp, clean and ready-to-wear
                                    garments.
                                </p>

                                <div style={styles.servicePrice}>
                                    ₹30
                                    <span>/ kg</span>
                                </div>
                            </div>

                            <div style={styles.serviceCard}>
                                <div style={styles.serviceIcon}>
                                    🧼
                                </div>

                                <h3>
                                    Wash & Fold
                                </h3>

                                <p>
                                    Complete washing and folding
                                    service.
                                </p>

                                <div style={styles.servicePrice}>
                                    ₹70
                                    <span>/ kg</span>
                                </div>
                            </div>

                        </>

                    )}

                </div>

            </section>


            {/* HOW IT WORKS */}

            <section
                id="how-it-works"
                style={styles.processSection}
            >

                <div style={styles.centerHeader}>

                    <span style={styles.processTag}>
                        HOW IT WORKS
                    </span>

                    <h2 style={styles.processTitle}>
                        Laundry made ridiculously simple.
                    </h2>

                    <p style={styles.processDescription}>
                        Three simple steps from your laundry
                        basket to fresh, clean clothes.
                    </p>

                </div>

                <div style={styles.stepsGrid}>

                    <div style={styles.stepCard}>

                        <div style={styles.stepNumber}>
                            01
                        </div>

                        <div style={styles.stepIcon}>
                            📋
                        </div>

                        <h3>
                            Choose your service
                        </h3>

                        <p>
                            Select the laundry service that
                            suits your clothes.
                        </p>

                    </div>

                    <div style={styles.stepConnector}>
                        →
                    </div>

                    <div style={styles.stepCard}>

                        <div style={styles.stepNumber}>
                            02
                        </div>

                        <div style={styles.stepIcon}>
                            🧺
                        </div>

                        <h3>
                            We take care of it
                        </h3>

                        <p>
                            Our system processes your order
                            and assigns the appropriate
                            machine.
                        </p>

                    </div>

                    <div style={styles.stepConnector}>
                        →
                    </div>

                    <div style={styles.stepCard}>

                        <div style={styles.stepNumber}>
                            03
                        </div>

                        <div style={styles.stepIcon}>
                            ✨
                        </div>

                        <h3>
                            Fresh & ready
                        </h3>

                        <p>
                            Your laundry is cleaned and your
                            order status can be tracked online.
                        </p>

                    </div>

                </div>

            </section>


            {/* STATS */}

            <section style={styles.statsSection}>

                <div style={styles.statsIntro}>

                    <span style={styles.sectionTag}>
                        BUILT FOR CONVENIENCE
                    </span>

                    <h2>
                        Less laundry stress.
                        <br />
                        More time for life.
                    </h2>

                </div>

                <div style={styles.statsGrid}>

                    <div style={styles.stat}>
                        <strong>
                            500+
                        </strong>

                        <span>
                            Orders completed
                        </span>
                    </div>

                    <div style={styles.stat}>
                        <strong>
                            4.9
                        </strong>

                        <span>
                            Customer experience
                        </span>
                    </div>

                    <div style={styles.stat}>
                        <strong>
                            24–48h
                        </strong>

                        <span>
                            Typical turnaround
                        </span>
                    </div>

                    <div style={styles.stat}>
                        <strong>
                            100%
                        </strong>

                        <span>
                            Digital ordering
                        </span>
                    </div>

                </div>

            </section>


            {/* CTA */}

            <section style={styles.ctaSection}>

                <div style={styles.ctaContent}>

                    <span style={styles.ctaTag}>
                        READY WHEN YOU ARE
                    </span>

                    <h2>
                        Your laundry.
                        <br />
                        Our care.
                    </h2>

                    <p>
                        Create your free LaundryCare account
                        and start managing your laundry
                        without the hassle.
                    </p>

                    <div style={styles.ctaButtons}>

                        <button
                            onClick={goToSignup}
                            style={styles.ctaPrimary}
                        >
                            Get Started
                            <span>→</span>
                        </button>

                        <button
                            onClick={goToLogin}
                            style={styles.ctaSecondary}
                        >
                            Already have an account?
                            <strong>
                                Login
                            </strong>
                        </button>

                    </div>

                </div>

            </section>


            {/* FOOTER */}

            <footer style={styles.footer}>

                <div style={styles.footerMain}>

                    <div style={styles.footerBrand}>

                        <div style={styles.footerLogo}>
                            🧺 Laundry
                            <span>
                                Care
                            </span>
                        </div>

                        <p>
                            Professional laundry care,
                            made simple.
                        </p>

                    </div>

                    <div style={styles.footerColumn}>

                        <h4>
                            Explore
                        </h4>

                        <button
                            onClick={() =>
                                scrollToSection("home")
                            }
                        >
                            Home
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection("services")
                            }
                        >
                            Services
                        </button>

                        <button
                            onClick={() =>
                                scrollToSection(
                                    "how-it-works"
                                )
                            }
                        >
                            How It Works
                        </button>

                    </div>

                    <div style={styles.footerColumn}>

                        <h4>
                            Account
                        </h4>

                        <button
                            onClick={goToLogin}
                        >
                            Login
                        </button>

                        <button
                            onClick={goToSignup}
                        >
                            Create Account
                        </button>

                    </div>

                    <div style={styles.footerColumn}>

                        <h4>
                            Contact
                        </h4>

                        <span>
                            Chennai, Tamil Nadu
                        </span>

                        <span>
                            support@laundrycare.com
                        </span>

                        <span>
                            Mon – Sat, 9 AM – 7 PM
                        </span>

                    </div>

                </div>

                <div style={styles.footerBottom}>

                    <span>
                        © 2026 LaundryCare.
                        All rights reserved.
                    </span>

                    <span>
                        Clean clothes. Clear mind.
                    </span>

                </div>

            </footer>

        </div>
    );
}

const styles = {

    page: {
        minHeight: "100vh",
        background: "#ffffff",
        color: "#111827",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },

    navbar: {
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: "76px",
        padding: "0 6%",
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(15px)",
        borderBottom:
            "1px solid rgba(226,232,240,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box"
    },

    logo: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        fontSize: "21px",
        fontWeight: "850",
        cursor: "pointer",
        letterSpacing: "-0.5px"
    },

    logoIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "11px",
        background: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "19px"
    },

    logoAccent: {
        color: "#4f46e5"
    },

    navLinks: {
        display: "flex",
        alignItems: "center",
        gap: "30px"
    },

    navLink: {
        border: "none",
        background: "transparent",
        color: "#475569",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        padding: "8px 0"
    },

    desktopActions: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    loginButton: {
        border: "none",
        background: "transparent",
        color: "#111827",
        fontWeight: "700",
        padding: "10px 15px",
        cursor: "pointer"
    },

    getStartedButton: {
        border: "none",
        background: "#111827",
        color: "white",
        borderRadius: "8px",
        padding: "11px 17px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    menuButton: {
        display: "none",
        border: "none",
        background: "transparent",
        fontSize: "24px",
        cursor: "pointer"
    },

    mobileLogin: {
        display: "none"
    },

    mobileSignup: {
        display: "none"
    },

    hero: {
        minHeight: "650px",
        padding: "80px 7%",
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: "50px",
        alignItems: "center",
        background:
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #eff6ff 100%)",
        boxSizing: "border-box",
        overflow: "hidden"
    },

    heroContent: {
        maxWidth: "650px"
    },

    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 13px",
        borderRadius: "30px",
        background: "#ffffff",
        color: "#4f46e5",
        fontSize: "10px",
        fontWeight: "850",
        letterSpacing: "1.5px",
        boxShadow:
            "0 5px 20px rgba(79,70,229,0.08)"
    },

    badgeDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#6366f1"
    },

    heroTitle: {
        fontSize: "68px",
        lineHeight: "1.02",
        letterSpacing: "-4px",
        margin: "25px 0 0",
        fontWeight: "900"
    },

    heroAccent: {
        color: "#4f46e5"
    },

    heroDescription: {
        maxWidth: "570px",
        color: "#64748b",
        fontSize: "18px",
        lineHeight: "1.7",
        marginTop: "25px"
    },

    heroButtons: {
        display: "flex",
        gap: "12px",
        marginTop: "32px"
    },

    heroPrimary: {
        border: "none",
        background: "#111827",
        color: "white",
        padding: "15px 21px",
        borderRadius: "9px",
        fontWeight: "750",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        fontSize: "14px"
    },

    heroSecondary: {
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#111827",
        padding: "15px 21px",
        borderRadius: "9px",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "14px"
    },

    heroTrust: {
        display: "flex",
        alignItems: "center",
        gap: "22px",
        marginTop: "45px"
    },

    trustItem: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },

    trustItemStrong: {
        fontSize: "17px",
        fontWeight: "850"
    },

    trustDivider: {
        width: "1px",
        height: "34px",
        background: "#cbd5e1"
    },

    heroVisual: {
        height: "500px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    blobOne: {
        position: "absolute",
        width: "390px",
        height: "390px",
        borderRadius: "50%",
        background:
            "linear-gradient(135deg, #c7d2fe, #bfdbfe)",
        filter: "blur(1px)"
    },

    blobTwo: {
        position: "absolute",
        width: "240px",
        height: "240px",
        borderRadius: "50%",
        background: "#e0e7ff",
        top: "20px",
        right: "10px",
        opacity: 0.8
    },

    machineCard: {
        position: "relative",
        zIndex: 3,
        width: "290px",
        minHeight: "230px",
        background: "white",
        borderRadius: "24px",
        padding: "32px",
        boxSizing: "border-box",
        boxShadow:
            "0 25px 60px rgba(30,41,59,0.18)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },

    machineCircle: {
        width: "75px",
        height: "75px",
        borderRadius: "50%",
        background: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
        marginBottom: "22px"
    },

    machineSmall: {
        fontSize: "9px",
        fontWeight: "850",
        letterSpacing: "2px",
        color: "#64748b",
        margin: 0
    },

    machineTitle: {
        fontSize: "27px",
        lineHeight: "1.1",
        margin: "7px 0 0",
        letterSpacing: "-1px"
    },

    floatingOrder: {
        position: "absolute",
        zIndex: 5,
        right: "0",
        bottom: "45px",
        background: "white",
        borderRadius: "13px",
        padding: "14px 17px",
        display: "flex",
        alignItems: "center",
        gap: "11px",
        boxShadow:
            "0 15px 35px rgba(15,23,42,0.13)"
    },

    successCircle: {
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background: "#dcfce7",
        color: "#15803d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "900"
    },

    floatingBubble: {
        position: "absolute",
        zIndex: 4,
        left: "20px",
        bottom: "70px",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
        boxShadow:
            "0 12px 30px rgba(15,23,42,0.12)"
    },

    benefitsSection: {
        padding: "90px 7%",
        background: "white"
    },

    centerHeader: {
        textAlign: "center",
        maxWidth: "700px",
        margin: "0 auto 45px"
    },

    sectionTag: {
        color: "#4f46e5",
        fontSize: "10px",
        fontWeight: "850",
        letterSpacing: "2px"
    },

    sectionTitle: {
        fontSize: "38px",
        lineHeight: "1.15",
        letterSpacing: "-1.5px",
        margin: "12px 0"
    },

    sectionDescription: {
        color: "#64748b",
        lineHeight: "1.7",
        fontSize: "16px"
    },

    benefitGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, 1fr)",
        gap: "18px"
    },

    benefitCard: {
        padding: "28px",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#ffffff"
    },

    benefitIcon: {
        width: "52px",
        height: "52px",
        borderRadius: "13px",
        background: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        marginBottom: "22px"
    },

    servicesSection: {
        padding: "90px 7%",
        background: "#f8fafc"
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "end",
        gap: "30px",
        marginBottom: "40px"
    },

    outlineButton: {
        border: "1px solid #cbd5e1",
        background: "white",
        borderRadius: "9px",
        padding: "13px 18px",
        fontWeight: "700",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    serviceGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, 1fr)",
        gap: "18px"
    },

    serviceCard: {
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "17px",
        padding: "25px",
        minHeight: "240px",
        boxSizing: "border-box",
        transition: "0.2s"
    },

    serviceTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start"
    },

    serviceIcon: {
        width: "55px",
        height: "55px",
        borderRadius: "14px",
        background: "#eef2ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px"
    },

    serviceArrow: {
        color: "#94a3b8",
        fontSize: "20px"
    },

    servicePrice: {
        marginTop: "20px",
        fontSize: "21px",
        fontWeight: "850"
    },

    processSection: {
        padding: "95px 7%",
        background: "#111827",
        color: "white"
    },

    processTag: {
        color: "#a5b4fc",
        fontSize: "10px",
        fontWeight: "850",
        letterSpacing: "2px"
    },

    processTitle: {
        fontSize: "40px",
        letterSpacing: "-1.5px",
        margin: "12px 0"
    },

    processDescription: {
        color: "#94a3b8",
        lineHeight: "1.7"
    },

    stepsGrid: {
        display: "grid",
        gridTemplateColumns:
            "1fr auto 1fr auto 1fr",
        alignItems: "center",
        gap: "25px"
    },

    stepCard: {
        padding: "30px",
        background: "#1f2937",
        border: "1px solid #374151",
        borderRadius: "17px"
    },

    stepNumber: {
        color: "#818cf8",
        fontWeight: "850",
        letterSpacing: "2px",
        fontSize: "11px"
    },

    stepIcon: {
        fontSize: "34px",
        margin: "22px 0"
    },

    stepConnector: {
        color: "#6366f1",
        fontSize: "28px"
    },

    statsSection: {
        padding: "75px 7%",
        display: "grid",
        gridTemplateColumns: "0.8fr 1.2fr",
        gap: "60px",
        alignItems: "center",
        background: "#f8fafc"
    },

    statsIntro: {
        maxWidth: "420px"
    },

    statsIntroH2: {
        fontSize: "35px"
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, 1fr)",
        gap: "1px",
        background: "#dbe2ea",
        border: "1px solid #dbe2ea"
    },

    stat: {
        background: "white",
        padding: "30px"
    },

    statStrong: {
        fontSize: "32px",
        fontWeight: "900"
    },

    ctaSection: {
        padding: "30px 7% 90px",
        background: "#f8fafc"
    },

    ctaContent: {
        background:
            "linear-gradient(135deg, #4f46e5, #4338ca)",
        borderRadius: "25px",
        padding: "65px",
        color: "white",
        textAlign: "center",
        boxShadow:
            "0 25px 60px rgba(79,70,229,0.2)"
    },

    ctaTag: {
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: "850",
        opacity: 0.8
    },

    ctaButtons: {
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        marginTop: "30px",
        flexWrap: "wrap"
    },

    ctaPrimary: {
        border: "none",
        background: "white",
        color: "#4338ca",
        borderRadius: "9px",
        padding: "14px 22px",
        fontWeight: "800",
        cursor: "pointer",
        display: "flex",
        gap: "12px"
    },

    ctaSecondary: {
        border: "1px solid rgba(255,255,255,0.35)",
        background: "transparent",
        color: "white",
        borderRadius: "9px",
        padding: "14px 22px",
        fontWeight: "600",
        cursor: "pointer"
    },

    footer: {
        background: "#0f172a",
        color: "white",
        padding: "60px 7% 25px"
    },

    footerMain: {
        display: "grid",
        gridTemplateColumns:
            "1.5fr 1fr 1fr 1.3fr",
        gap: "50px",
        paddingBottom: "50px"
    },

    footerBrand: {
        maxWidth: "260px"
    },

    footerLogo: {
        fontSize: "21px",
        fontWeight: "850"
    },

    footerColumn: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },

    footerColumnButton: {
        border: "none",
        background: "transparent",
        color: "#94a3b8",
        textAlign: "left",
        padding: 0,
        cursor: "pointer"
    },

    footerBottom: {
        borderTop: "1px solid #1e293b",
        paddingTop: "22px",
        display: "flex",
        justifyContent: "space-between",
        color: "#64748b",
        fontSize: "12px"
    }
};

export default Home;