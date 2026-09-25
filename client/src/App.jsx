import { useEffect, useState } from "react";

import CustomerProfile from "./pages/customer/Profile";
import CustomerOrders from "./pages/customer/Orders";
import CustomerPayments from "./pages/customer/Payments";

import AdminDashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import AdminOrders from "./pages/admin/Orders";
import Services from "./pages/admin/Services";
import Machines from "./pages/admin/Machines";
import AdminPayments from "./pages/admin/Payments";
import Transactions from "./pages/admin/Transactions";



const laundryThemeStyles = `
    :root {
        --lc-navy: #172B3A;
        --lc-blue: #155E75;
        --lc-blue-dark: #0E4658;
        --lc-blue-soft: #EAF4F6;
        --lc-cream: #F7F9F8;
        --lc-surface: #FFFFFF;
        --lc-border: #DCE5E7;
        --lc-muted: #667780;
        --lc-gold: #B88A44;
        --lc-success: #2F7D5B;
        --lc-warning: #B7791F;
        --lc-danger: #B54747;
        --lc-shadow-sm: 0 3px 12px rgba(23, 43, 58, 0.06);
        --lc-shadow-md: 0 12px 32px rgba(23, 43, 58, 0.08);
        --lc-radius: 14px;
    }

    *, *::before, *::after { box-sizing: border-box; }

    html {
        background: var(--lc-cream);
        scroll-behavior: smooth;
    }

    body {
        margin: 0;
        min-width: 320px;
        background: var(--lc-cream);
        color: var(--lc-navy);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    #root {
        min-height: 100vh;
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
    }

    button, input, select, textarea { font: inherit; }

    button { cursor: pointer; }

    a {
        color: var(--lc-blue);
        text-decoration: none;
        transition: color 160ms ease;
    }

    a:hover { color: var(--lc-blue-dark); }

    h1, h2, h3, h4, h5, h6 {
        margin-top: 0;
        color: var(--lc-navy);
        letter-spacing: -0.02em;
    }

    p { color: var(--lc-muted); }

    .laundry-theme {
        min-height: 100vh;
        background:
            radial-gradient(circle at 8% 0%, rgba(21, 94, 117, 0.035), transparent 26%),
            var(--lc-cream);
    }

    .laundry-theme-main {
        min-height: 100vh;
    }

    .laundry-theme input,
    .laundry-theme select,
    .laundry-theme textarea {
        min-height: 46px;
        border: 1px solid var(--lc-border);
        border-radius: 10px;
        background: var(--lc-surface);
        color: var(--lc-navy);
        outline: none;
        transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .laundry-theme input::placeholder,
    .laundry-theme textarea::placeholder { color: #98A6AD; }

    .laundry-theme input:focus,
    .laundry-theme select:focus,
    .laundry-theme textarea:focus {
        border-color: var(--lc-blue);
        box-shadow: 0 0 0 3px rgba(21, 94, 117, 0.10);
    }

    .laundry-theme button {
        border-radius: 10px;
        transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, border-color 150ms ease;
    }

    .laundry-theme button:hover { transform: translateY(-1px); }

    .laundry-theme button:focus-visible,
    .laundry-theme a:focus-visible,
    .laundry-theme input:focus-visible,
    .laundry-theme select:focus-visible,
    .laundry-theme textarea:focus-visible {
        outline: 3px solid rgba(21, 94, 117, 0.20);
        outline-offset: 2px;
    }

    .laundry-theme table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background: var(--lc-surface);
        border: 1px solid var(--lc-border);
        border-radius: var(--lc-radius);
        overflow: hidden;
    }

    .laundry-theme th {
        background: #F5F8F8;
        color: #4F616A;
        font-weight: 700;
        text-align: left;
        font-size: 12px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .laundry-theme th,
    .laundry-theme td {
        padding: 13px 15px;
        border-bottom: 1px solid #E7EEF0;
    }

    .laundry-theme tr:last-child td { border-bottom: 0; }

    .laundry-theme tbody tr:hover { background: #FBFCFC; }

    .laundry-theme label {
        color: var(--lc-navy);
        font-size: 13px;
        font-weight: 700;
    }

    .laundry-public-shell,
    .laundry-auth-shell,
    .laundry-loading-shell {
        min-height: 100vh;
        background:
            radial-gradient(circle at 10% 10%, rgba(21, 94, 117, 0.06), transparent 25%),
            radial-gradient(circle at 88% 18%, rgba(184, 138, 68, 0.055), transparent 21%),
            var(--lc-cream);
    }

    .laundry-auth-shell {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 42px 20px;
    }

    .laundry-auth-shell::before {
        content: "";
        position: fixed;
        left: -110px;
        bottom: -110px;
        width: 260px;
        height: 260px;
        border: 1px solid rgba(21, 94, 117, 0.10);
        border-radius: 50%;
        pointer-events: none;
    }

    .laundry-auth-shell::after {
        content: "";
        position: fixed;
        right: -80px;
        top: -80px;
        width: 220px;
        height: 220px;
        background: rgba(184, 138, 68, 0.035);
        border-radius: 50%;
        pointer-events: none;
    }

    .laundry-page-transition {
        animation: laundryFadeIn 260ms ease both;
    }

    @keyframes laundryFadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .laundry-loading-shell {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 24px;
    }

    .laundry-loading-card {
        width: min(420px, 100%);
        padding: 44px 34px;
        background: rgba(255,255,255,0.94);
        border: 1px solid var(--lc-border);
        border-radius: 18px;
        box-shadow: var(--lc-shadow-md);
    }

    .laundry-brand {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 27px;
        font-weight: 700;
        letter-spacing: -0.025em;
        color: var(--lc-navy);
    }

    .laundry-brand span { color: var(--lc-blue); }

    .laundry-loading-mark {
        width: 42px;
        height: 42px;
        margin: 0 auto 18px;
        border-radius: 50%;
        border: 3px solid #DCE8EA;
        border-top-color: var(--lc-blue);
        animation: laundrySpin 850ms linear infinite;
    }

    @keyframes laundrySpin { to { transform: rotate(360deg); } }

    .laundry-loading-copy {
        margin: 10px 0 0;
        color: var(--lc-muted);
        font-size: 14px;
    }

    .laundry-shell-error {
        max-width: 1400px;
        margin: 14px auto 0;
        padding: 12px 16px;
        background: #FFF4F3;
        border: 1px solid #F2D0CC;
        color: var(--lc-danger);
        border-radius: 10px;
        box-shadow: var(--lc-shadow-sm);
    }

    .laundry-customer-main {
        width: min(1400px, calc(100% - 32px));
        margin: 0 auto;
        padding: 30px 0 52px;
    }

    .laundry-admin-main {
        flex: 1;
        min-width: 0;
        padding: 26px 30px 46px;
        overflow-x: auto;
    }

    .laundry-admin-layout {
        display: flex;
        min-height: 100vh;
        background: var(--lc-cream);
    }

    .laundry-customer-layout {
        min-height: 100vh;
        background: var(--lc-cream);
    }

    @media (max-width: 900px) {
        .laundry-admin-main { padding: 22px 18px 36px; }
        .laundry-customer-main { width: min(100% - 24px, 1400px); padding-top: 22px; }
    }

    @media (max-width: 640px) {
        .laundry-auth-shell { padding: 20px 12px; }
        .laundry-customer-main { width: calc(100% - 18px); padding-top: 16px; }
        .laundry-admin-main { padding: 16px 12px 28px; }
        .laundry-loading-card { padding: 34px 22px; }
        .laundry-brand { font-size: 24px; }
    }


    /* Premium public site */
    .public-site { width:100%; min-height:100vh; color: var(--lc-navy); background: #F8FAF9; }
    .public-nav { position: sticky; top: 0; z-index: 50; display:flex; align-items:center; justify-content:space-between; gap:32px; width:100%; min-height:78px; padding:0 clamp(24px,5.2vw,86px); background:rgba(248,250,249,.96); backdrop-filter: blur(14px); border-bottom:1px solid #E4EAEB; }
    .public-nav > a { color:inherit; }
    .lc-brand { font-family: Georgia, "Times New Roman", serif; font-size:28px; font-weight:700; letter-spacing:-.03em; color:#142A39; }
    .lc-brand span { color: var(--lc-blue); }
    .lc-brand-compact { font-size:24px; }
    .public-nav-links { display:flex; gap:28px; align-items:center; margin-left:auto; }
    .public-nav-links a { color:#3E5360; font-size:14px; font-weight:600; }
    .public-nav-links a:hover { color:var(--lc-blue); }
    .public-nav-actions { display:flex; align-items:center; gap:10px; }
    .public-login { padding:11px 13px; font-size:14px; font-weight:700; color:var(--lc-navy); }
    .public-primary { padding:12px 18px; border:1px solid var(--lc-blue); border-radius:10px; background:var(--lc-blue); color:#fff !important; font-size:14px; font-weight:700; box-shadow:0 6px 16px rgba(21,94,117,.14); }
    .public-primary:hover { background:var(--lc-blue-dark); }
    .public-hero { display:grid; grid-template-columns:minmax(0,1.08fr) minmax(420px,.92fr); gap:clamp(44px,5vw,82px); align-items:center; width:100%; min-height:650px; padding:90px clamp(28px,7vw,110px) 96px; background:linear-gradient(135deg,#F7FAF9 0%,#EEF5F5 100%); }
    .public-hero-copy { max-width:760px; min-width:0; }
    .eyebrow { margin-bottom:14px; color:#6B7B84; font-size:11px; font-weight:800; letter-spacing:.20em; text-transform:uppercase; }
    .public-hero h1 { margin:0; max-width:760px; font-size:clamp(48px,5vw,72px); line-height:1.03; letter-spacing:-.052em; color:#142A39; font-weight:770; }
    .public-hero h1 span { display:block; color:var(--lc-blue); white-space:nowrap; }
    .public-hero-copy > p { max-width:610px; margin:24px 0 0; font-size:18px; line-height:1.7; color:#61747F; }
    .hero-actions { display:flex; gap:12px; margin-top:30px; flex-wrap:wrap; }
    .button { display:inline-flex; align-items:center; justify-content:center; min-height:46px; padding:12px 19px; border-radius:10px; border:1px solid transparent; font-weight:750; font-size:14px; cursor:pointer; }
    .button-primary { background:var(--lc-blue); color:#fff !important; border-color:var(--lc-blue); box-shadow:0 7px 18px rgba(21,94,117,.14); }
    .button-primary:hover { background:var(--lc-blue-dark); color:#fff !important; }
    .button-secondary { background:#fff; color:var(--lc-navy) !important; border-color:#CCDADD; }
    .button-secondary:hover { border-color:var(--lc-blue); }
    .hero-trust { display:flex; gap:18px; flex-wrap:wrap; margin-top:22px; color:#596D77; font-size:12px; font-weight:650; }
    .hero-trust span::before { content:"✓"; margin-right:7px; color:var(--lc-success); }
    .public-hero-visual { min-height:450px; position:relative; display:flex; justify-content:center; align-items:center; }
    .hero-circle { width:min(430px,80%); aspect-ratio:1; border-radius:50%; background:#DDEBED; border:1px solid #C7DDE1; box-shadow:inset 0 0 0 22px rgba(255,255,255,.20); }
    .hero-process-card { position:absolute; width:min(360px,78%); padding:24px; background:#fff; border:1px solid #DDE5E7; box-shadow:0 18px 40px rgba(23,43,58,.11); border-radius:16px; }
    .hero-process-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; padding-bottom:15px; border-bottom:1px solid #E4EAEC; }
    .hero-process-heading span { color:#7B8A91; font-size:9px; font-weight:850; letter-spacing:.17em; }
    .hero-process-heading strong { display:block; margin-top:5px; font-size:18px; color:var(--lc-navy); }
    .hero-process-heading small { color:#7A8A92; font-size:11px; }
    .hero-process-list { display:grid; gap:13px; margin-top:16px; }
    .hero-process-item { display:grid; grid-template-columns:32px 1fr auto; align-items:center; gap:10px; }
    .hero-process-number { width:30px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#EEF5F6; color:var(--lc-blue); font-size:10px; font-weight:850; }
    .hero-process-item strong { display:block; font-size:12px; color:#223A49; }
    .hero-process-item small { display:block; margin-top:3px; color:#7A8990; font-size:10px; }
    .hero-process-dot { width:8px; height:8px; border-radius:50%; background:#79AE91; box-shadow:0 0 0 4px rgba(121,174,145,.12); }
    .hero-status-card { position:absolute; left:0; bottom:18px; width:220px; padding:15px 16px; background:#fff; border:1px solid #DDE5E7; box-shadow:0 14px 32px rgba(23,43,58,.10); border-radius:14px; }
    .hero-status-card span { display:block; color:#7C8C93; font-size:9px; font-weight:850; letter-spacing:.16em; }
    .hero-status-card strong { display:block; margin-top:5px; color:var(--lc-navy); font-size:15px; }
    .hero-status-card small { display:block; margin-top:4px; color:#71828B; font-size:10px; line-height:1.45; }
    .public-section { padding:88px 8vw; }
    .section-heading-row { display:flex; align-items:flex-end; justify-content:space-between; gap:40px; margin-bottom:36px; }
    .section-heading-row h2, .pricing-panel h2, .dashboard-callout h2 { margin:0; max-width:680px; font-size:40px; line-height:1.08; letter-spacing:-.035em; color:#172F40; }
    .section-heading-row > p { max-width:430px; margin:0; color:#6B7C85; line-height:1.65; }
    .service-grid { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid #DCE5E7; border-left:1px solid #DCE5E7; background:#fff; }
    .service-card { padding:27px; min-height:272px; border-right:1px solid #DCE5E7; border-bottom:1px solid #DCE5E7; display:flex; flex-direction:column; }
    .service-card-top { display:flex; justify-content:space-between; align-items:center; }
    .service-tag { display:inline-flex; padding:5px 8px; border:1px solid #DCE5E7; border-radius:999px; background:#F7FAFA; color:#58707B; font-size:10px; font-weight:750; letter-spacing:.03em; }
    .service-mark { color:var(--lc-blue); font-weight:800; }
    .service-rule { width:34px; height:2px; margin-top:45px; background:var(--lc-gold); }
    .service-card h3 { margin:22px 0 8px; font-size:21px; color:#172F40; }
    .service-card p { margin:0; color:#708089; font-size:14px; line-height:1.65; }
    .service-card a { margin-top:auto; padding-top:20px; color:var(--lc-blue); font-size:13px; font-weight:800; }
    .public-process { background:#EFF5F5; border-top:1px solid #DCE7E8; border-bottom:1px solid #DCE7E8; }
    .process-inner { padding-top:82px; padding-bottom:88px; }
    .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .step-card { display:grid; grid-template-columns:auto 1fr; gap:18px; min-height:180px; padding:25px; background:#fff; border:1px solid #DCE5E7; border-radius:12px; }
    .step-number { font-size:12px; font-weight:850; letter-spacing:.08em; color:var(--lc-gold); }
    .step-card h3 { margin:1px 0 9px; font-size:20px; color:#172F40; }
    .step-card p { margin:0; color:#708089; line-height:1.65; }
    .pricing-panel { display:grid; grid-template-columns:1fr 1fr; gap:70px; padding:56px; border:1px solid #D9E3E5; background:#fff; border-radius:16px; box-shadow:var(--lc-shadow-sm); }
    .pricing-panel h2 { max-width:560px; }
    .pricing-panel p { max-width:540px; line-height:1.7; }
    .pricing-list { border-top:1px solid #DDE5E7; }
    .pricing-list div { display:flex; justify-content:space-between; align-items:center; padding:18px 0; border-bottom:1px solid #E7ECEE; }
    .pricing-list span { font-weight:700; color:#29404F; }
    .pricing-list strong { color:var(--lc-blue); font-size:12px; letter-spacing:.08em; text-transform:uppercase; }
    .why-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .why-grid > div { padding:25px; border-top:2px solid var(--lc-blue); background:#fff; border:1px solid #DCE5E7; }
    .why-grid span { color:var(--lc-gold); font-weight:800; font-size:12px; }
    .why-grid h3 { margin:28px 0 7px; font-size:20px; }
    .why-grid p { margin:0; line-height:1.65; }
    .faq-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .faq-grid details { background:#fff; border:1px solid #DCE5E7; padding:20px 22px; border-radius:10px; }
    .faq-grid summary { cursor:pointer; color:#233B4A; font-weight:750; }
    .faq-grid p { margin:15px 0 0; line-height:1.65; }
    .public-footer { display:grid; grid-template-columns:1.5fr 1fr auto; align-items:end; gap:34px; padding:48px 8vw 34px; border-top:1px solid #DCE5E7; background:#F2F6F6; }
    .public-footer p { max-width:360px; line-height:1.6; }
    .footer-links { display:flex; gap:18px; flex-wrap:wrap; }
    .footer-links a { font-size:13px; font-weight:700; color:#50646F; }
    .footer-note { font-size:11px; color:#7A8990; }

    /* Auth */
    .auth-page { width:min(1120px,100%); margin:0 auto; }
    .auth-brand-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:26px; }
    .auth-brand-bar > span { color:#778890; font-size:12px; font-weight:750; letter-spacing:.08em; text-transform:uppercase; }
    .auth-layout { display:grid; grid-template-columns:1fr 500px; min-height:690px; overflow:hidden; border:1px solid #DCE5E7; border-radius:18px; background:#fff; box-shadow:var(--lc-shadow-md); }
    .auth-story { padding:58px 52px; background:linear-gradient(145deg,#173A4A 0%,#12303E 100%); color:#fff; position:relative; overflow:hidden; }
    .auth-story::after { content:""; position:absolute; width:290px; height:290px; border:1px solid rgba(255,255,255,.11); border-radius:50%; right:-120px; bottom:-120px; }
    .auth-story .eyebrow { color:#B8CBD1; }
    .auth-story h1 { position:relative; z-index:1; max-width:460px; margin:36px 0 18px; color:#fff !important; font-size:47px; line-height:1.04; letter-spacing:-.045em; }
    .auth-story > p { position:relative; z-index:1; max-width:470px; color:#CFDDE1 !important; line-height:1.7; font-size:15px; }
    .auth-story-list { position:relative; z-index:1; display:grid; gap:13px; margin-top:42px; }
    .auth-story-list div { display:flex; align-items:center; gap:11px; color:#F3F7F8; font-size:13px; }
    .auth-story-list span { width:29px; height:29px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.24); border-radius:50%; color:#E6C991; font-size:10px; font-weight:800; }
    .auth-panel { padding:42px 42px 46px; background:#fff; }
    .auth-back { display:inline-block; margin-bottom:42px; color:#5E7380 !important; font-size:13px; font-weight:650; }
    .auth-panel-header .eyebrow { margin-bottom:12px; }
    .auth-panel-header h2 { margin:0; font-size:37px; line-height:1.05; color:#172F40; letter-spacing:-.04em; }
    .auth-panel-header p { margin:12px 0 28px; line-height:1.6; }
    .auth-form { display:grid; gap:17px; }
    .auth-form label { display:grid; gap:7px; color:#2E4553 !important; font-size:12px !important; font-weight:800 !important; text-align:left !important; }
    .auth-form input, .auth-form textarea { width:100%; padding:0 14px; border:1px solid #CBD9DD !important; border-radius:9px !important; background:#fff !important; color:#203847 !important; font-size:14px !important; min-height:48px; }
    .auth-form textarea { padding:13px 14px; min-height:90px; resize:vertical; }
    .auth-form input::placeholder, .auth-form textarea::placeholder { color:#9AA8AE !important; opacity:1; }
    .auth-form input:focus, .auth-form textarea:focus { border-color:var(--lc-blue) !important; box-shadow:0 0 0 3px rgba(21,94,117,.10) !important; }
    .password-field { position:relative; }
    .password-field input { padding-right:70px; }
    .password-field button { position:absolute; right:8px; top:7px; min-height:34px; padding:0 9px; border:0; background:transparent; color:var(--lc-blue); font-size:11px; font-weight:800; }
    .auth-submit { width:100%; min-height:49px; margin-top:3px; border:1px solid var(--lc-blue); border-radius:9px; background:var(--lc-blue); color:#fff; font-size:14px; font-weight:800; }
    .auth-submit:hover { background:var(--lc-blue-dark); }
    .auth-submit:disabled { opacity:.65; cursor:wait; }
    .auth-switch { margin:19px 0 0; text-align:center; font-size:13px; }
    .auth-switch a { font-weight:800; }
    .auth-alert { padding:11px 13px; margin-bottom:18px; border-radius:8px; font-size:12px; line-height:1.45; }
    .auth-alert-error { background:#FFF2F1; border:1px solid #F0D0CC; color:#9F4640; }
    .auth-alert-success { background:#EFF8F2; border:1px solid #D2E9DA; color:#2F7D5B; }

    /* Customer navigation and dashboard */
    .customer-nav { position:sticky; top:0; z-index:60; min-height:76px; background:rgba(255,255,255,.96); border-bottom:1px solid #DEE6E8; backdrop-filter:blur(14px); }
    .customer-nav-inner { max-width:1440px; min-height:76px; margin:0 auto; padding:0 28px; display:flex; align-items:center; gap:25px; }
    .customer-brand-button { border:0; background:transparent; padding:0; }
    .customer-nav-links { display:flex; align-items:center; gap:7px; margin-left:17px; }
    .customer-nav-links button { min-height:43px; padding:0 14px; border:1px solid transparent; background:transparent; color:#3E5360; font-size:13px; font-weight:700; }
    .customer-nav-links button.is-active { color:#183241; border-color:#CEDBDD; background:#F7FAFA; }
    .customer-nav-actions { display:flex; align-items:center; gap:9px; margin-left:auto; }
    .nav-cart, .nav-logout { min-height:42px; padding:0 13px; border:1px solid #D5E0E3; background:#fff; color:#2E4654; font-size:12px; font-weight:750; }
    .nav-cart { position:relative; }
    .nav-cart span { position:absolute; top:-7px; right:-6px; min-width:18px; height:18px; display:flex; align-items:center; justify-content:center; padding:0 5px; border-radius:50%; background:var(--lc-blue); color:#fff; font-size:9px; }
    .nav-profile { display:flex; align-items:center; gap:9px; min-height:42px; padding:0 10px 0 5px; border:0; background:transparent; color:#203846; font-size:12px; }
    .nav-profile span { width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#182D3B; color:#fff; font-size:12px; font-weight:800; }
    .mobile-nav-toggle { display:none; border:0; background:transparent; color:#172F40; font-size:20px; }
    .laundry-customer-main { width:min(1400px,calc(100% - 48px)); padding:38px 0 58px; }
    .dashboard-hero { display:flex; align-items:flex-end; justify-content:space-between; gap:40px; padding:38px 0 28px; border-bottom:1px solid #DEE6E8; }
    .dashboard-hero h1, .page-heading h1 { margin:0; color:#172F40 !important; font-size:44px; line-height:1.05; letter-spacing:-.045em; }
    .dashboard-hero p, .page-heading p { max-width:650px; margin:13px 0 0; color:#6B7C85 !important; line-height:1.65; }
    .dashboard-hero-actions { display:flex; gap:9px; flex-wrap:wrap; }
    .dashboard-stats { display:grid; grid-template-columns:repeat(4,1fr); margin-top:18px; border:1px solid #DDE6E8; background:#fff; }
    .dashboard-stats > div { padding:22px 24px; border-right:1px solid #DDE6E8; }
    .dashboard-stats > div:last-child { border-right:0; }
    .dashboard-stats span, .dashboard-stats small { display:block; color:#75858C; font-size:11px; }
    .dashboard-stats strong { display:block; margin:7px 0 4px; color:#172F40; font-size:25px; letter-spacing:-.02em; }
    .dashboard-grid { display:grid; grid-template-columns:1.3fr 1fr; gap:16px; margin-top:18px; }
    .dashboard-panel { padding:27px; border:1px solid #DDE6E8; background:#fff; box-shadow:var(--lc-shadow-sm); }
    .panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; }
    .panel-heading h2 { margin:0; color:#172F40 !important; font-size:22px; }
    .status-chip { display:inline-flex; align-items:center; min-height:27px; padding:0 10px; border:1px solid #DCE5E7; border-radius:999px; background:#F6F9F9; color:#5B6E78; font-size:10px; font-weight:850; text-transform:capitalize; }
    .status-pending { background:#FFF8EA; border-color:#ECDDBA; color:#8D6A26; }
    .status-processing { background:#EEF6FA; border-color:#D1E1E8; color:#245D73; }
    .status-completed { background:#EEF8F2; border-color:#D4E8DA; color:#2F7D5B; }
    .status-cancelled { background:#FFF3F2; border-color:#F0D2CE; color:#A34D45; }
    .order-meta-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:11px; margin:28px 0 24px; }
    .order-meta-grid > div { padding:13px; background:#F7FAFA; border:1px solid #E3EAEC; }
    .order-meta-grid span, .order-meta-grid strong { display:block; }
    .order-meta-grid span { color:#788890; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }
    .order-meta-grid strong { margin-top:6px; color:#233D4C; font-size:14px; }
    .order-progress { display:grid; grid-template-columns:repeat(3,1fr); height:4px; gap:5px; margin-top:6px; }
    .order-progress div { background:#E5ECEE; }
    .order-progress div.done { background:var(--lc-blue); }
    .progress-labels { display:flex; justify-content:space-between; margin-top:8px; color:#788991; font-size:10px; }
    .text-button { border:0; background:transparent; padding:0; color:var(--lc-blue); font-size:12px; font-weight:800; }
    .empty-panel { padding:28px 0 5px; }
    .mini-service-list { display:grid; margin-top:23px; border-top:1px solid #E1E8EA; }
    .mini-service-list > div { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 0; border-bottom:1px solid #E1E8EA; }
    .mini-service-list strong, .mini-service-list span { display:block; }
    .mini-service-list strong { font-size:13px; color:#28414F; }
    .mini-service-list span { max-width:270px; margin-top:4px; color:#7A8A91; font-size:11px; line-height:1.4; }
    .mini-service-list em { color:var(--lc-blue); font-style:normal; font-weight:800; font-size:12px; }
    .dashboard-callout { margin-top:18px; display:flex; align-items:center; justify-content:space-between; gap:30px; padding:30px 32px; background:#EFF5F5; border:1px solid #D7E3E5; }
    .dashboard-callout h2 { font-size:28px; }
    .dashboard-callout p { margin:8px 0 0; }
    .page-heading { margin-bottom:31px; }
    .split-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:25px; border-bottom:1px solid #DDE6E8; padding-bottom:25px; }
    .services-catalog { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .catalog-card { display:grid; grid-template-columns:58px 1fr; gap:18px; border:1px solid #DDE6E8; background:#fff; min-height:245px; padding:25px; box-shadow:var(--lc-shadow-sm); }
    .catalog-number { color:var(--lc-gold); font-size:11px; font-weight:850; letter-spacing:.08em; }
    .catalog-top { display:flex; justify-content:space-between; gap:15px; align-items:flex-start; }
    .catalog-top h2 { margin:10px 0 0; font-size:23px; color:#172F40 !important; }
    .catalog-top > strong { color:var(--lc-blue); font-size:16px; white-space:nowrap; }
    .catalog-top > strong small { color:#7A8990; font-size:10px; font-weight:700; }
    .catalog-content p { min-height:50px; margin:18px 0 20px; line-height:1.6; }
    .tracking-list { display:grid; gap:14px; }
    .tracking-card { padding:28px; background:#fff; border:1px solid #DDE6E8; box-shadow:var(--lc-shadow-sm); }
    .tracking-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; }
    .tracking-card-head h2 { margin:0; color:#172F40 !important; font-size:22px; }
    .tracking-summary { display:flex; gap:22px; flex-wrap:wrap; margin:19px 0 25px; padding-bottom:17px; border-bottom:1px solid #E3E9EB; color:#718089; font-size:11px; }
    .tracking-summary span:first-child { color:#213C4C; font-size:14px; font-weight:800; }
    .tracking-steps { display:grid; grid-template-columns:repeat(3,1fr); position:relative; gap:15px; }
    .tracking-steps::before { content:""; position:absolute; left:18px; right:18px; top:17px; height:1px; background:#DDE6E8; z-index:0; }
    .tracking-step { position:relative; z-index:1; display:flex; gap:12px; background:#fff; }
    .step-dot { width:35px; height:35px; flex:0 0 35px; display:flex; align-items:center; justify-content:center; border:1px solid #D5E0E3; border-radius:50%; background:#F8FAFA; color:#7B8A91; font-size:11px; font-weight:800; }
    .tracking-step.is-done .step-dot { border-color:#2F7D5B; background:#EEF8F2; color:#2F7D5B; }
    .tracking-step.is-current strong { color:var(--lc-blue); }
    .tracking-step strong, .tracking-step small { display:block; }
    .tracking-step strong { color:#334B58; font-size:12px; }
    .tracking-step small { margin-top:4px; color:#7A8990; line-height:1.4; font-size:10px; }
    .tracking-footer { display:flex; justify-content:space-between; align-items:center; margin-top:26px; padding-top:15px; border-top:1px solid #E4EAEC; font-size:11px; }
    .tracking-footer span { color:#7C8A91; }
    .tracking-footer strong { color:#234152; }
    .tracking-empty { padding:70px 30px; text-align:center; border:1px dashed #CBD9DD; background:#fff; }
    .empty-symbol { margin:0 auto 15px; width:48px; height:48px; display:flex; align-items:center; justify-content:center; border:1px solid #D6E1E4; color:var(--lc-blue); font-family:Georgia,serif; font-weight:800; }
    .tracking-empty h2 { margin:0; color:#172F40; }
    .tracking-empty p { margin:9px auto 21px; max-width:390px; }
    .cancelled-state { padding:15px; border:1px solid #F0D2CE; background:#FFF6F5; color:#9C4A43; font-size:12px; }

    /* Cart + checkout */
    .cart-page-v2,
    .checkout-page-v2 { padding-top: 10px; }

    .page-heading-v2 { margin: 0 0 28px; }
    .page-heading-v2 .eyebrow { margin-bottom: 9px; }
    .page-heading-v2 h1 { margin: 0; color:#172F40 !important; font-size:48px; line-height:1.05; letter-spacing:-.045em; }
    .page-heading-v2 p { max-width:660px; margin:11px 0 0; color:#6B7C85 !important; font-size:14px; line-height:1.65; }

    .cart-layout-v2 { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(300px,.7fr); gap:18px; align-items:start; }
    .cart-panel-v2,
    .cart-summary-v2,
    .checkout-panel-v2 { border:1px solid #DDE6E8; background:#fff; box-shadow:var(--lc-shadow-sm); }
    .cart-panel-v2 { padding:26px; }
    .cart-panel-head-v2,
    .checkout-panel-head-v2 { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding-bottom:16px; border-bottom:1px solid #E4EAEC; }
    .cart-panel-head-v2 h2,
    .checkout-panel-head-v2 h2 { margin:0; color:#1E3746 !important; font-size:20px; letter-spacing:-.02em; }
    .cart-count-v2 { color:#7A8990; font-size:11px; }
    .cart-item-v2 { display:grid; grid-template-columns:minmax(0,1.2fr) 120px 150px 105px; gap:18px; align-items:center; padding:20px 0; border-bottom:1px solid #E7ECEE; }
    .cart-item-v2:last-child { border-bottom:0; padding-bottom:3px; }
    .cart-item-v2 strong { display:block; color:#213B4A; font-size:14px; }
    .cart-item-v2 small { display:block; margin-top:5px; color:#7A8990; font-size:11px; line-height:1.45; }
    .cart-price-v2 { color:#31505E; font-size:12px; font-weight:700; }
    .cart-label-v2 { display:block; margin-bottom:6px; color:#849199; font-size:9px; letter-spacing:.08em; text-transform:uppercase; font-weight:800; }
    .cart-qty-v2 { display:flex; align-items:center; width:max-content; border:1px solid #D9E2E5; }
    .cart-qty-v2 button { width:34px; height:34px; border:0; background:#F8FAFA; color:#31505E; font-size:16px; font-weight:700; }
    .cart-qty-v2 input { width:56px; min-height:34px !important; padding:0 7px; border:0 !important; border-left:1px solid #D9E2E5 !important; border-right:1px solid #D9E2E5 !important; border-radius:0 !important; text-align:center; box-shadow:none !important; font-size:12px; font-weight:700; }
    .cart-subtotal-v2 { color:#1D3948; font-size:13px; font-weight:800; text-align:right; }
    .cart-remove-v2 { margin-top:7px; padding:0; border:0; background:transparent; color:#A34D45; font-size:10px; font-weight:750; }
    .cart-summary-v2 { padding:27px; position:sticky; top:96px; }
    .cart-summary-v2 h2 { margin:0; color:#203A49; font-size:20px; }
    .summary-line-v2 { display:flex; justify-content:space-between; gap:20px; margin-top:21px; padding-bottom:15px; border-bottom:1px solid #E4EAEC; color:#718089; font-size:12px; }
    .summary-line-v2 strong { color:#243E4C; }
    .summary-total-v2 { display:flex; justify-content:space-between; align-items:center; gap:20px; margin-top:17px; color:#203A49; font-size:14px; }
    .summary-total-v2 strong { color:#172F40; font-size:21px; letter-spacing:-.02em; }
    .summary-note-v2 { margin:14px 0 0; color:#7A8990; font-size:10px; line-height:1.55; }
    .cart-summary-actions-v2 { display:grid; gap:9px; margin-top:21px; }

    .cart-empty-v2 { min-height:430px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; text-align:center; border:1px solid #DDE6E8; background:#fff; box-shadow:var(--lc-shadow-sm); }
    .cart-empty-mark-v2 { width:56px; height:56px; display:grid; place-items:center; margin-bottom:17px; border:1px solid #D6E1E4; color:var(--lc-blue); background:#F8FBFB; font-size:18px; font-weight:800; }
    .cart-empty-v2 h2 { margin:0; color:#203A49; font-size:22px; }
    .cart-empty-v2 p { margin:8px 0 21px; max-width:400px; font-size:13px; }

    .checkout-layout-v2 { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(320px,.72fr); gap:18px; align-items:start; }
    .checkout-left-v2 { display:grid; gap:18px; }
    .checkout-panel-v2 { padding:26px; }
    .pickup-details-v2 { display:grid; gap:0; margin-top:4px; }
    .pickup-row-v2 { display:grid; grid-template-columns:135px 1fr; gap:20px; padding:16px 0; border-bottom:1px solid #E7ECEE; }
    .pickup-row-v2:last-child { border-bottom:0; padding-bottom:2px; }
    .pickup-row-v2 > span { color:#6F8088; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.07em; }
    .pickup-row-v2 strong { color:#243E4C; font-size:13px; font-weight:750; }
    .pickup-row-v2 address { margin:0; color:#314A58; font-size:13px; line-height:1.55; font-style:normal; }
    .checkout-note-v2 { margin-top:15px; padding:13px 14px; border:1px solid #E1EAEC; background:#F7FAFA; color:#6E7E86; font-size:10px; line-height:1.55; }

    .payment-option-v2 { display:flex; align-items:center; gap:14px; padding:16px 17px; margin-top:5px; border:1px solid #BED1D6; background:#F7FBFB; }
    .payment-icon-v2 { width:35px; height:35px; display:grid; place-items:center; border:1px solid #CFE0E3; background:#fff; color:var(--lc-blue); font-size:11px; font-weight:800; }
    .payment-option-v2 strong { display:block; color:#243E4C; font-size:13px; }
    .payment-option-v2 span { display:block; margin-top:4px; color:#7A8990; font-size:10px; }

    .checkout-summary-v2 { position:sticky; top:96px; }
    .checkout-items-v2 { display:grid; gap:0; margin-top:17px; border-top:1px solid #E7ECEE; }
    .checkout-item-v2 { display:flex; justify-content:space-between; gap:14px; padding:14px 0; border-bottom:1px solid #E7ECEE; }
    .checkout-item-v2 strong { color:#2A4351; font-size:12px; }
    .checkout-item-v2 span { display:block; margin-top:3px; color:#7A8990; font-size:10px; }
    .checkout-item-v2 em { color:#243E4C; font-size:12px; font-style:normal; font-weight:800; white-space:nowrap; }
    .checkout-total-v2 { display:flex; justify-content:space-between; align-items:center; gap:20px; margin-top:19px; color:#203A49; }
    .checkout-total-v2 span { font-size:13px; }
    .checkout-total-v2 strong { color:#172F40; font-size:22px; letter-spacing:-.02em; }
    .checkout-submit-v2 { width:100%; margin-top:20px; min-height:50px; border:1px solid var(--lc-blue); background:var(--lc-blue); color:#fff; font-size:13px; font-weight:800; }
    .checkout-submit-v2:disabled { opacity:.65; cursor:not-allowed; transform:none !important; }
    .checkout-back-v2 { width:100%; margin-top:9px; min-height:44px; border:1px solid #D5E0E3; background:#fff; color:#324A57; font-size:11px; font-weight:750; }

    @media (max-width: 1050px) {
        .cart-layout-v2,
        .checkout-layout-v2 { grid-template-columns:1fr; }
        .cart-summary-v2,
        .checkout-summary-v2 { position:static; }
    }
    @media (max-width: 760px) {
        .page-heading-v2 h1 { font-size:38px; }
        .cart-panel-v2,
        .cart-summary-v2,
        .checkout-panel-v2 { padding:20px; }
        .cart-item-v2 { grid-template-columns:1fr 1fr; gap:13px; }
        .cart-price-v2 { text-align:right; }
        .cart-subtotal-v2 { text-align:left; }
        .pickup-row-v2 { grid-template-columns:1fr; gap:7px; }
        .cart-empty-v2 { min-height:340px; padding:30px 20px; }
    }

    /* Order confirmation */
    .success-page { max-width: 1040px; margin: 0 auto; padding: 62px 0 90px; }
    .success-card { max-width: 760px; margin: 0 auto; padding: 48px 48px 44px; text-align: center; background:#fff; border:1px solid #DDE6E8; box-shadow:var(--lc-shadow-md); border-radius:18px; }
    .success-check { width:66px; height:66px; margin:0 auto 20px; border-radius:50%; display:grid; place-items:center; background:#E8F7EF; color:#2F7D5B; font-size:33px; font-weight:800; }
    .success-card h1 { max-width:600px; margin:9px auto 13px; color:#172F40 !important; font-size:44px; line-height:1.08; letter-spacing:-.045em; }
    .success-lead { max-width:560px; margin:0 auto; color:#6B7C85 !important; font-size:15px; line-height:1.65; }
    .success-details { display:grid; grid-template-columns:repeat(4,1fr); margin-top:28px; border:1px solid #DDE6E8; background:#fff; text-align:left; }
    .success-details > div { min-height:92px; padding:17px 18px; border-right:1px solid #DDE6E8; display:flex; flex-direction:column; justify-content:center; gap:7px; background:#FBFCFC; }
    .success-details > div:last-child { border-right:0; }
    .success-details span { color:#7A8990; font-size:10px; text-transform:uppercase; letter-spacing:.09em; }
    .success-details strong { color:#233D4C; font-size:14px; }
    .success-details .status-chip { align-self:flex-start; }
    .success-actions { display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:28px; }

    /* Admin */
    .laundry-admin-layout { display:flex; min-height:100vh; }
    .admin-sidebar { width:255px; flex:0 0 255px; display:flex; flex-direction:column; min-height:100vh; position:sticky; top:0; height:100vh; background:#142A39; color:#fff; padding:27px 17px 19px; }
    .admin-sidebar-brand { padding:0 10px 26px; border-bottom:1px solid rgba(255,255,255,.10); }
    .admin-sidebar .lc-brand { color:#fff; }
    .admin-sidebar .lc-brand span { color:#A8CDD5; }
    .admin-workspace-label { margin:27px 10px 10px; color:#8EA7B2; font-size:9px; font-weight:850; letter-spacing:.18em; }
    .admin-nav { display:grid; gap:5px; }
    .admin-nav button { display:grid; grid-template-columns:34px 1fr; align-items:center; gap:9px; width:100%; min-height:45px; padding:0 10px; border:1px solid transparent; border-radius:8px; background:transparent; color:#D6E1E4; text-align:left; font-size:12px; font-weight:700; }
    .admin-nav button:hover { background:rgba(255,255,255,.05); }
    .admin-nav button.is-active { background:#214454; border-color:#2E596A; color:#fff; }
    .nav-index { color:#7F9BA6; font-size:10px; font-weight:800; }
    .admin-nav button.is-active .nav-index { color:#D2A969; }
    .admin-sidebar-bottom { margin-top:auto; padding-top:18px; border-top:1px solid rgba(255,255,255,.10); }
    .admin-role { display:flex; align-items:center; gap:10px; padding:8px 10px 14px; }
    .role-dot { width:8px; height:8px; border-radius:50%; background:#70B58C; box-shadow:0 0 0 4px rgba(112,181,140,.12); }
    .admin-role strong, .admin-role small { display:block; }
    .admin-role strong { color:#F5F8F9; font-size:12px; }
    .admin-role small { margin-top:3px; color:#91A7B0; font-size:9px; text-transform:uppercase; letter-spacing:.08em; }
    .admin-logout { width:100%; min-height:40px; border:1px solid rgba(255,255,255,.14); background:transparent; color:#DDE7EA; font-size:11px; font-weight:750; }
    .admin-logout:hover { background:rgba(255,255,255,.06); }
    .laundry-admin-main { flex:1; min-width:0; padding:0 34px 46px; overflow-x:auto; }
    .admin-topbar { min-height:105px; display:flex; align-items:center; justify-content:space-between; gap:30px; border-bottom:1px solid #DDE6E8; }
    .admin-topbar h1 { margin:0; color:#172F40 !important; font-size:29px; letter-spacing:-.035em; }
    .admin-user { display:flex; align-items:center; gap:10px; }
    .admin-user > span { width:37px; height:37px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#183240; color:#fff; font-size:12px; font-weight:800; }
    .admin-user strong, .admin-user small { display:block; }
    .admin-user strong { color:#203846; font-size:12px; }
    .admin-user small { margin-top:2px; color:#7A8990; font-size:10px; }

    @media (max-width: 1050px) {
        .public-nav-links { display:none; }
        .public-hero { grid-template-columns:1fr; min-height:auto; padding-top:64px; }
        .public-hero-visual { min-height:400px; }
        .service-grid { grid-template-columns:1fr 1fr; }
        .pricing-panel { grid-template-columns:1fr; gap:34px; }
        .public-footer { grid-template-columns:1fr 1fr; }
        .auth-layout { grid-template-columns:1fr; }
        .auth-story { padding:42px; }
        .auth-story h1 { font-size:40px; }
        .auth-panel { padding:36px 34px; }
        .dashboard-hero { align-items:flex-start; flex-direction:column; }
        .dashboard-stats { grid-template-columns:1fr 1fr; }
        .dashboard-grid { grid-template-columns:1fr; }
        .services-catalog { grid-template-columns:1fr; }
        .admin-sidebar { width:220px; flex-basis:220px; }
        .laundry-admin-main { padding-left:24px; padding-right:24px; }
    }
    @media (max-width: 720px) {
        .success-page { padding:34px 0 56px; }
        .success-card { padding:34px 18px 30px; }
        .success-card h1 { font-size:34px; }
        .success-details { grid-template-columns:1fr 1fr; }
        .success-details > div { border-bottom:1px solid #DDE6E8; }
        .success-details > div:nth-child(2n) { border-right:0; }
        .success-details > div:nth-child(3), .success-details > div:nth-child(4) { border-bottom:0; }
    }

    @media (max-width: 720px) {
        .public-nav { padding:0 18px; }
        .public-nav-actions .public-login { display:none; }
        .public-primary { padding:10px 12px; font-size:12px; }
        .public-hero { padding:48px 22px 55px; gap:25px; }
        .public-hero h1 { font-size:46px; }
        .public-hero h1 span { white-space:normal; }
        .hero-circle { width:280px; height:280px; }
        .hero-card-top { left:-2px; }
        .hero-card-bottom { right:-4px; }
        .public-section { padding:60px 22px; }
        .section-heading-row { display:block; }
        .section-heading-row > p { margin-top:15px; }
        .section-heading-row h2, .pricing-panel h2 { font-size:32px; }
        .service-grid, .steps-grid, .why-grid, .faq-grid { grid-template-columns:1fr; }
        .pricing-panel { padding:28px; }
        .public-footer { grid-template-columns:1fr; padding-left:22px; padding-right:22px; }
        .auth-layout { min-height:0; }
        .auth-story { display:none; }
        .auth-panel { padding:30px 23px 34px; }
        .auth-panel-header h2 { font-size:32px; }
        .auth-brand-bar { padding:0 4px; }
        .auth-brand-bar > span { display:none; }
        .customer-nav-inner { padding:0 14px; gap:12px; }
        .mobile-nav-toggle { display:block; }
        .customer-nav-links { position:absolute; top:76px; left:0; right:0; display:none; flex-direction:column; align-items:stretch; padding:10px 14px 14px; background:#fff; border-bottom:1px solid #DDE6E8; box-shadow:0 14px 26px rgba(23,43,58,.08); }
        .customer-nav-links.is-open { display:flex; }
        .customer-nav-links button { width:100%; text-align:left; }
        .customer-nav-actions { gap:3px; }
        .nav-profile strong, .nav-logout { display:none; }
        .nav-profile { padding:0 3px; }
        .laundry-customer-main { width:calc(100% - 24px); padding-top:22px; }
        .dashboard-stats { grid-template-columns:1fr; }
        .dashboard-stats > div { border-right:0; border-bottom:1px solid #DDE6E8; }
        .dashboard-stats > div:last-child { border-bottom:0; }
        .order-meta-grid { grid-template-columns:1fr; }
        .split-heading { display:block; }
        .tracking-steps { grid-template-columns:1fr; }
        .tracking-steps::before { left:17px; right:auto; top:17px; bottom:17px; width:1px; height:auto; }
        .tracking-step { background:transparent; }
        .dashboard-callout { display:block; }
        .dashboard-callout .button { margin-top:18px; }
        .catalog-card { grid-template-columns:1fr; }
        .admin-sidebar { position:static; width:100%; height:auto; min-height:0; }
        .laundry-admin-layout { display:block; }
        .admin-sidebar-brand { display:flex; justify-content:space-between; }
        .admin-nav { grid-template-columns:1fr 1fr; }
        .admin-sidebar-bottom { margin-top:20px; }
        .admin-topbar { min-height:92px; }
        .admin-user { display:none; }
        .laundry-admin-main { padding:0 14px 28px; }
    }
`;

const ThemeShell = ({ children, className = "" }) => (
    <div className={`laundry-theme ${className}`}>
        <style>{laundryThemeStyles}</style>
        {children}
    </div>
);


const goTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
};

const Brand = ({ compact = false }) => (
    <div className={`lc-brand ${compact ? "lc-brand-compact" : ""}`}>
        Laundry<span>Care</span>
    </div>
);

const PremiumPublicHome = () => {
    const serviceCards = [
        {
            title: "Wash & Fold",
            text: "Everyday clothes cleaned, dried and folded with care.",
            tag: "Everyday care"
        },
        {
            title: "Dry Cleaning",
            text: "Professional care for delicate and special garments.",
            tag: "Special care"
        },
        {
            title: "Ironing",
            text: "Crisp, neatly finished garments ready for your wardrobe.",
            tag: "Neat finish"
        },
        {
            title: "Regular Wash",
            text: "A dependable wash service for your weekly laundry.",
            tag: "Simple & easy"
        }
    ];

    const steps = [
        ["01", "Choose a service", "Select the care your clothes need."],
        ["02", "Book your order", "Add your items, confirm the details and checkout."],
        ["03", "Track the journey", "Follow your order from processing to completion."]
    ];

    return (
        <ThemeShell className="laundry-public-shell">
            <div className="public-site">
                <header className="public-nav">
                    <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}><Brand /></a>
                    <nav className="public-nav-links">
                        <a href="#services">Services</a>
                        <a href="#how-it-works">How it works</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#faq">FAQ</a>
                    </nav>
                    <div className="public-nav-actions">
                        <a className="public-login" href="/login">Sign in</a>
                        <a className="public-primary" href="/signup">Schedule a pickup</a>
                    </div>
                </header>

                <section className="public-hero">
                    <div className="public-hero-copy">
                        <div className="eyebrow">PROFESSIONAL LAUNDRY CARE</div>
                        <h1>Fresh clothes.<br /><span>Less to worry about.</span></h1>
                        <p>
                            Simple laundry care with a clear process, transparent service
                            choices and order tracking from start to finish.
                        </p>
                        <div className="hero-actions">
                            <a className="button button-primary" href="/signup">Book a pickup</a>
                            <a className="button button-secondary" href="#services">Explore services</a>
                        </div>
                        <div className="hero-trust">
                            <span>Easy online booking</span>
                            <span>Order tracking</span>
                            <span>Clear service pricing</span>
                        </div>
                    </div>
                    <div className="public-hero-visual" aria-hidden="true">
                        <div className="hero-circle"></div>
                        <div className="hero-process-card">
                            <div className="hero-process-heading">
                                <div>
                                    <span>YOUR LAUNDRY JOURNEY</span>
                                    <strong>Simple from start to finish</strong>
                                </div>
                                <small>03 stages</small>
                            </div>
                            <div className="hero-process-list">
                                <div className="hero-process-item">
                                    <span className="hero-process-number">01</span>
                                    <div><strong>Book a pickup</strong><small>Choose your service and place an order.</small></div>
                                    <span className="hero-process-dot"></span>
                                </div>
                                <div className="hero-process-item">
                                    <span className="hero-process-number">02</span>
                                    <div><strong>Professional care</strong><small>Your laundry moves through the service workflow.</small></div>
                                    <span className="hero-process-dot"></span>
                                </div>
                                <div className="hero-process-item">
                                    <span className="hero-process-number">03</span>
                                    <div><strong>Track and receive</strong><small>Follow your order until it is completed.</small></div>
                                    <span className="hero-process-dot"></span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-status-card">
                            <span>ORDER STATUS</span>
                            <strong>Processing</strong>
                            <small>Your current order status stays visible in your account.</small>
                        </div>
                    </div>
                </section>

                <section className="public-section" id="services">
                    <div className="section-heading-row">
                        <div>
                            <div className="eyebrow">OUR SERVICES</div>
                            <h2>Care for every kind of laundry.</h2>
                        </div>
                        <p>Choose a service, add the weight and let LaundryCare handle the rest.</p>
                    </div>
                    <div className="service-grid">
                        {serviceCards.map((service) => (
                            <article className="service-card" key={service.title}>
                                <div className="service-card-top">
                                    <span className="service-tag">{service.tag}</span>
                                    <span className="service-mark">↗</span>
                                </div>
                                <div className="service-rule"></div>
                                <h3>{service.title}</h3>
                                <p>{service.text}</p>
                                <a href="/signup">Choose service <span>→</span></a>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="public-process" id="how-it-works">
                    <div className="public-section process-inner">
                        <div className="section-heading-row">
                            <div>
                                <div className="eyebrow">HOW IT WORKS</div>
                                <h2>Laundry without the complicated stuff.</h2>
                            </div>
                            <p>A simple process designed to make ordering clear and convenient.</p>
                        </div>
                        <div className="steps-grid">
                            {steps.map(([number, title, text]) => (
                                <article className="step-card" key={number}>
                                    <div className="step-number">{number}</div>
                                    <div>
                                        <h3>{title}</h3>
                                        <p>{text}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="public-section" id="pricing">
                    <div className="pricing-panel">
                        <div>
                            <div className="eyebrow">SIMPLE PRICING</div>
                            <h2>Know what you are choosing before you checkout.</h2>
                            <p>Service prices are managed in the LaundryCare catalogue and shown before an order is placed.</p>
                        </div>
                        <div className="pricing-list">
                            <div><span>Wash & Fold</span><strong>Per kg</strong></div>
                            <div><span>Regular Wash</span><strong>Per kg</strong></div>
                            <div><span>Dry Cleaning</span><strong>Per kg</strong></div>
                            <div><span>Ironing</span><strong>Per kg</strong></div>
                        </div>
                    </div>
                </section>

                <section className="public-section why-section">
                    <div className="section-heading-row">
                        <div>
                            <div className="eyebrow">WHY LAUNDRYCARE</div>
                            <h2>A service experience built around clarity.</h2>
                        </div>
                    </div>
                    <div className="why-grid">
                        <div><span>01</span><h3>Professional care</h3><p>Service choices are organized around the way your clothes need to be handled.</p></div>
                        <div><span>02</span><h3>Easy ordering</h3><p>Choose services, add weight and complete checkout without unnecessary steps.</p></div>
                        <div><span>03</span><h3>Order visibility</h3><p>Keep your orders, payment information and tracking in one customer account.</p></div>
                    </div>
                </section>

                <section className="public-section faq-section" id="faq">
                    <div className="section-heading-row">
                        <div><div className="eyebrow">FAQ</div><h2>Questions, answered simply.</h2></div>
                    </div>
                    <div className="faq-grid">
                        <details open><summary>How do I place an order?</summary><p>Sign in, choose a service, add the required weight to your cart and continue to checkout.</p></details>
                        <details><summary>Can I track my laundry order?</summary><p>Yes. Your customer account includes a dedicated order tracking view based on the current order status.</p></details>
                        <details><summary>How is the price calculated?</summary><p>The service catalogue stores a price per kilogram and your order total is calculated from the selected service and weight.</p></details>
                        <details><summary>Where can I see my payments?</summary><p>Your customer account includes a separate payments page so your order and payment history stay easy to review.</p></details>
                    </div>
                </section>

                <footer className="public-footer">
                    <div><Brand /><p>Professional laundry care with a clear digital experience.</p></div>
                    <div className="footer-links"><a href="#services">Services</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><a href="/login">Sign in</a></div>
                    <div className="footer-note">LaundryCare · Customer service portal</div>
                </footer>
            </div>
        </ThemeShell>
    );
};

const PremiumAuthScreen = ({ mode, selectedRole = "customer", onLogin, onSignup, onBack, onBackToLogin }) => {
    const isSignup = mode === "signup";
    const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", address: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const authAPI = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const submitLogin = async (event) => {
        event.preventDefault();
        setFormError("");
        if (!form.email.trim() || !form.password) return setFormError("Please enter your email and password.");
        setSubmitting(true);
        try {
            const response = await fetch(`${authAPI}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: form.email.trim(), password: form.password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to sign in.");
            if (data.user?.role !== selectedRole) throw new Error(selectedRole === "admin" ? "This account is not an administrator account." : "Please use a customer account to sign in here.");
            await onLogin(data.user);
        } catch (error) {
            setFormError(error.message || "Unable to sign in.");
        } finally {
            setSubmitting(false);
        }
    };

    const submitSignup = async (event) => {
        event.preventDefault();
        setFormError("");
        setSuccessMessage("");
        const required = [form.name, form.phone, form.email, form.password, form.address];
        if (required.some((value) => !value.trim())) return setFormError("Please complete all fields.");
        if (form.password.length < 6) return setFormError("Password must be at least 6 characters.");
        setSubmitting(true);
        try {
            const response = await fetch(`${authAPI}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to create the account.");
            setSuccessMessage("Your account is ready. Redirecting to sign in...");
            setTimeout(() => onSignup(), 900);
        } catch (error) {
            setFormError(error.message || "Unable to create the account.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ThemeShell className="laundry-auth-shell">
            <div className={`auth-page ${isSignup ? "auth-signup" : "auth-login"}`}>
                <div className="auth-brand-bar">
                    <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}><Brand /></a>
                    <span>{selectedRole === "admin" ? "Administrator access" : "Customer account"}</span>
                </div>
                <div className="auth-layout">
                    <section className="auth-story">
                        <div className="eyebrow">{selectedRole === "admin" ? "SECURE WORKSPACE" : "LAUNDRYCARE"}</div>
                        <h1>{isSignup ? "A cleaner way to manage your laundry." : selectedRole === "admin" ? "Manage the laundry operation with clarity." : "Your laundry, organised from one place."}</h1>
                        <p>{isSignup ? "Create a customer account to book services, view orders, follow progress and keep your payments together." : selectedRole === "admin" ? "Use the administrator workspace to manage customers, orders, services, machines, payments and transactions." : "Sign in to access services, cart, orders, tracking, payments and your profile."}</p>
                        <div className="auth-story-list">
                            <div><span>01</span>Easy online ordering</div>
                            <div><span>02</span>Clear order status</div>
                            <div><span>03</span>All account details in one place</div>
                        </div>
                    </section>
                    <section className="auth-panel">
                        <a className="auth-back" href={isSignup ? "/login" : "/"} onClick={(e) => { e.preventDefault(); isSignup ? onBackToLogin() : onBack(); }}>← {isSignup ? "Back to sign in" : "Back to website"}</a>
                        <div className="auth-panel-header">
                            <div className="eyebrow">{selectedRole === "admin" ? "ADMIN SIGN IN" : isSignup ? "CUSTOMER ACCOUNT" : "WELCOME BACK"}</div>
                            <h2>{isSignup ? "Create your account" : "Sign in to LaundryCare"}</h2>
                            <p>{isSignup ? "Set up your account and start managing your laundry online." : "Enter your details to continue to your LaundryCare account."}</p>
                        </div>

                        {formError && <div className="auth-alert auth-alert-error">{formError}</div>}
                        {successMessage && <div className="auth-alert auth-alert-success">{successMessage}</div>}

                        <form onSubmit={isSignup ? submitSignup : submitLogin} className="auth-form">
                            {isSignup && <>
                                <label>Full name<input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Enter your full name" autoComplete="name" /></label>
                                <label>Phone number<input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="Enter your phone number" inputMode="tel" autoComplete="tel" /></label>
                            </>}
                            <label>Email address<input name={isSignup ? "customer_email" : "login_email"} type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" autoComplete={isSignup ? "new-email" : "username"} autoCapitalize="none" spellCheck="false" /></label>
                            <label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateField("password", e.target.value)} placeholder={isSignup ? "At least 6 characters" : "Enter your password"} autoComplete={isSignup ? "new-password" : "current-password"} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div></label>
                            {isSignup && <label>Address<textarea value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Enter your pickup / delivery address" rows={3} autoComplete="street-address" /></label>}
                            <button className="auth-submit" disabled={submitting} type="submit">{submitting ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Create account" : "Sign in")}</button>
                        </form>
                        {!isSignup && selectedRole === "customer" && <p className="auth-switch">New to LaundryCare? <a href="/signup" onClick={(e) => { e.preventDefault(); window.location.href = "/signup"; }}>Create an account</a></p>}
                        {isSignup && <p className="auth-switch">Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>Sign in</a></p>}
                    </section>
                </div>
            </div>
        </ThemeShell>
    );
};

const PremiumCustomerNavbar = ({ activePage, setActivePage, onLogout, cartCount, profile }) => {
    const [open, setOpen] = useState(false);
    const links = [
        ["dashboard", "Home"],
        ["services", "Services"],
        ["track", "Track Order"],
        ["orders", "My Orders"]
    ];
    const go = (page) => { setActivePage(page); setOpen(false); };
    const initial = (profile?.name || "Customer").trim().charAt(0).toUpperCase();

    return (
        <header className="customer-nav">
            <div className="customer-nav-inner">
                <button className="mobile-nav-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">☰</button>
                <button className="customer-brand-button" onClick={() => go("dashboard")}><Brand /></button>
                <nav className={`customer-nav-links ${open ? "is-open" : ""}`}>
                    {links.map(([page, label]) => <button key={page} className={activePage === page ? "is-active" : ""} onClick={() => go(page)}>{label}</button>)}
                </nav>
                <div className="customer-nav-actions">
                    <button className="nav-cart" onClick={() => go("cart")} aria-label="Shopping cart">Cart{cartCount > 0 && <span>{cartCount}</span>}</button>
                    <button className="nav-profile" onClick={() => go("profile")}><span>{initial}</span><strong>{profile?.name || "Customer"}</strong></button>
                    <button className="nav-logout" onClick={onLogout}>Logout</button>
                </div>
            </div>
        </header>
    );
};

const PremiumAdminSidebar = ({ activePage, setActivePage, onLogout, role }) => {
    const links = [
        ["dashboard", "Overview"],
        ["customers", "Customers"],
        ["orders", "Orders"],
        ["services", "Services"],
        ["machines", "Machines"],
        ["payments", "Payments"],
        ["transactions", "Transactions"]
    ];
    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-brand"><Brand compact /></div>
            <div className="admin-workspace-label">OPERATIONS</div>
            <nav className="admin-nav">
                {links.map(([page, label]) => <button key={page} className={activePage === page ? "is-active" : ""} onClick={() => setActivePage(page)}><span className="nav-index">{String(links.findIndex((item) => item[0] === page) + 1).padStart(2, "0")}</span>{label}</button>)}
            </nav>
            <div className="admin-sidebar-bottom">
                <div className="admin-role"><span className="role-dot"></span><div><strong>Administrator</strong><small>{role}</small></div></div>
                <button className="admin-logout" onClick={onLogout}>Sign out</button>
            </div>
        </aside>
    );
};

const PremiumAdminHeader = ({ title, user, profile }) => (
    <header className="admin-topbar">
        <div><div className="eyebrow">LAUNDRYCARE ADMIN</div><h1>{title}</h1></div>
        <div className="admin-user"><span>{(profile?.name || user?.email || "A").charAt(0).toUpperCase()}</span><div><strong>{profile?.name || "Administrator"}</strong><small>{user?.email}</small></div></div>
    </header>
);

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const PremiumCustomerDashboard = ({ profile, orders, payments, services, onExploreServices, onTrackOrder }) => {
    const activeOrders = orders.filter((order) => ["pending", "processing"].includes(order.status));
    const latestOrder = [...orders].sort((a, b) => Number(b.order_id) - Number(a.order_id))[0];
    const totalPaid = payments.filter((p) => p.payment_status === "paid").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const activeStatus = latestOrder?.status || "pending";

    return (
        <div className="customer-dashboard premium-page">
            <section className="dashboard-hero">
                <div><div className="eyebrow">CUSTOMER PORTAL</div><h1>Good to see you, {profile?.name?.split(" ")[0] || "there"}.</h1><p>Manage your laundry, check your current orders and choose your next service from one place.</p></div>
                <div className="dashboard-hero-actions"><button className="button button-primary" onClick={onExploreServices}>Book a service</button><button className="button button-secondary" onClick={onTrackOrder}>Track an order</button></div>
            </section>
            <section className="dashboard-stats">
                <div><span>Total orders</span><strong>{orders.length}</strong><small>Your order history</small></div>
                <div><span>Active orders</span><strong>{activeOrders.length}</strong><small>Currently in progress</small></div>
                <div><span>Paid amount</span><strong>{formatMoney(totalPaid)}</strong><small>Recorded payments</small></div>
                <div><span>Services</span><strong>{services.length}</strong><small>Available to book</small></div>
            </section>
            <section className="dashboard-grid">
                <article className="dashboard-panel order-panel">
                    <div className="panel-heading"><div><div className="eyebrow">LATEST ORDER</div><h2>{latestOrder ? `Order #${latestOrder.order_id}` : "No orders yet"}</h2></div>{latestOrder && <span className={`status-chip status-${activeStatus}`}>{activeStatus}</span>}</div>
                    {latestOrder ? <>
                        <div className="order-meta-grid"><div><span>Weight</span><strong>{latestOrder.weight} kg</strong></div><div><span>Total</span><strong>{formatMoney(latestOrder.total_amount)}</strong></div><div><span>Created</span><strong>{new Date(latestOrder.created_at).toLocaleDateString("en-IN")}</strong></div></div>
                        <div className="order-progress"><div className={activeStatus === "pending" || activeStatus === "processing" || activeStatus === "completed" ? "done" : ""}></div><div className={activeStatus === "processing" || activeStatus === "completed" ? "done" : ""}></div><div className={activeStatus === "completed" ? "done" : ""}></div></div><div className="progress-labels"><span>Placed</span><span>Processing</span><span>Completed</span></div>
                        <button className="text-button" onClick={onTrackOrder}>Open tracking →</button>
                    </> : <div className="empty-panel"><p>Your first order can start with a service of your choice.</p><button className="button button-primary" onClick={onExploreServices}>Browse services</button></div>}
                </article>
                <article className="dashboard-panel service-preview">
                    <div className="panel-heading"><div><div className="eyebrow">SERVICES</div><h2>Popular care options</h2></div><button className="text-button" onClick={onExploreServices}>View all</button></div>
                    <div className="mini-service-list">{services.slice(0, 4).map((service) => <div key={service.service_id}><div><strong>{service.service_name}</strong><span>{service.description || "Professional laundry care"}</span></div><em>{formatMoney(service.price_per_kg)}/kg</em></div>)}</div>
                </article>
            </section>
            <section className="dashboard-callout"><div><div className="eyebrow">READY WHEN YOU ARE</div><h2>Give your next load the care it deserves.</h2><p>Choose a service and continue to checkout in a few simple steps.</p></div><button className="button button-primary" onClick={onExploreServices}>Explore services</button></section>
        </div>
    );
};

const PremiumCustomerServices = ({ services, onAddToCart }) => (
    <div className="customer-services premium-page">
        <section className="page-heading"><div className="eyebrow">SERVICES</div><h1>Choose the right care for your clothes.</h1><p>Select a service and add the weight you need. Your exact order total is calculated at checkout.</p></section>
        <div className="services-catalog">{services.map((service, index) => <article className="catalog-card" key={service.service_id}><div className="catalog-number">{String(index + 1).padStart(2, "0")}</div><div className="catalog-content"><div className="catalog-top"><div><span className="service-tag">LaundryCare service</span><h2>{service.service_name}</h2></div><strong>{formatMoney(service.price_per_kg)}<small>/kg</small></strong></div><p>{service.description || "Professional laundry care designed for convenient ordering and reliable results."}</p><button className="button button-primary" onClick={() => onAddToCart(service)}>Add to cart</button></div></article>)}</div>
    </div>
);

const PremiumCart = ({ cart, onUpdateWeight, onRemove, onCheckout, onContinueShopping }) => {
    const totalWeight = cart.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    const totalAmount = cart.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.price_per_kg || 0), 0);

    if (cart.length === 0) {
        return (
            <div className="cart-page-v2 premium-page">
                <section className="page-heading-v2">
                    <div className="eyebrow">YOUR CART</div>
                    <h1>Shopping cart</h1>
                    <p>Review your selected laundry services before continuing to checkout.</p>
                </section>
                <section className="cart-empty-v2">
                    <div className="cart-empty-mark-v2">LC</div>
                    <h2>Your cart is empty.</h2>
                    <p>Add a laundry service to get started with your next order.</p>
                    <button className="button button-primary" onClick={onContinueShopping}>Browse services</button>
                </section>
            </div>
        );
    }

    return (
        <div className="cart-page-v2 premium-page">
            <section className="page-heading-v2">
                <div className="eyebrow">YOUR CART</div>
                <h1>Shopping cart</h1>
                <p>Check your services and weight, then continue to a clear order summary.</p>
            </section>

            <div className="cart-layout-v2">
                <section className="cart-panel-v2">
                    <div className="cart-panel-head-v2">
                        <div><div className="eyebrow">SELECTED SERVICES</div><h2>Order details</h2></div>
                        <span className="cart-count-v2">{cart.length} {cart.length === 1 ? "service" : "services"}</span>
                    </div>

                    {cart.map((item) => {
                        const weight = Number(item.weight || 0);
                        const price = Number(item.price_per_kg || 0);
                        const subtotal = weight * price;
                        return (
                            <div className="cart-item-v2" key={item.service_id}>
                                <div>
                                    <strong>{item.service_name}</strong>
                                    <small>{item.description || "Professional laundry care"}</small>
                                </div>
                                <div className="cart-price-v2">
                                    <span className="cart-label-v2">Rate</span>
                                    {formatMoney(price)} / kg
                                </div>
                                <div>
                                    <span className="cart-label-v2">Weight</span>
                                    <div className="cart-qty-v2">
                                        <button type="button" onClick={() => onUpdateWeight(item.service_id, Math.max(1, weight - 1))}>−</button>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={weight}
                                            onChange={(e) => onUpdateWeight(item.service_id, e.target.value)}
                                            aria-label={`Weight for ${item.service_name}`}
                                        />
                                        <button type="button" onClick={() => onUpdateWeight(item.service_id, weight + 1)}>+</button>
                                    </div>
                                    <button type="button" className="cart-remove-v2" onClick={() => onRemove(item.service_id)}>Remove</button>
                                </div>
                                <div className="cart-subtotal-v2">
                                    {formatMoney(subtotal)}
                                </div>
                            </div>
                        );
                    })}
                </section>

                <aside className="cart-summary-v2">
                    <div className="eyebrow">ORDER SUMMARY</div>
                    <h2>Before checkout</h2>
                    <div className="summary-line-v2"><span>Total weight</span><strong>{totalWeight.toFixed(2)} kg</strong></div>
                    <div className="summary-line-v2"><span>Service total</span><strong>{formatMoney(totalAmount)}</strong></div>
                    <div className="summary-total-v2"><span>Total</span><strong>{formatMoney(totalAmount)}</strong></div>
                    <p className="summary-note-v2">Your final total is calculated from each selected service and its weight.</p>
                    <div className="cart-summary-actions-v2">
                        <button className="button button-primary" onClick={onCheckout}>Continue to checkout</button>
                        <button className="button button-secondary" onClick={onContinueShopping}>Add another service</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const PremiumCheckout = ({ cart, profile, onPlaceOrder, loading, onBackToCart, onOpenProfile }) => {
    const totalAmount = cart.reduce((sum, item) => sum + Number(item.weight || 0) * Number(item.price_per_kg || 0), 0);

    if (cart.length === 0) {
        return (
            <div className="checkout-page-v2 premium-page">
                <section className="cart-empty-v2">
                    <div className="cart-empty-mark-v2">LC</div>
                    <h2>Your cart is empty.</h2>
                    <p>Add a service before continuing to checkout.</p>
                    <button className="button button-primary" onClick={onBackToCart}>Return to cart</button>
                </section>
            </div>
        );
    }

    return (
        <div className="checkout-page-v2 premium-page">
            <section className="page-heading-v2">
                <div className="eyebrow">CHECKOUT</div>
                <h1>Review your order.</h1>
                <p>Confirm your saved service address and order details before placing your laundry order.</p>
            </section>

            <div className="checkout-layout-v2">
                <div className="checkout-left-v2">
                    <section className="checkout-panel-v2">
                        <div className="checkout-panel-head-v2">
                            <div><div className="eyebrow">SERVICE ADDRESS</div><h2>Pickup details</h2></div>
                            <button className="text-button" type="button" onClick={onOpenProfile}>Edit profile</button>
                        </div>
                        <div className="pickup-details-v2">
                            <div className="pickup-row-v2"><span>Name</span><strong>{profile?.name || "Customer"}</strong></div>
                            <div className="pickup-row-v2"><span>Phone</span><strong>{profile?.phone || "Not available"}</strong></div>
                            <div className="pickup-row-v2"><span>Address</span><address>{profile?.address || "Add an address in your profile before placing an order."}</address></div>
                        </div>
                        <div className="checkout-note-v2">This is the customer address currently stored in your profile and used for the order service details.</div>
                    </section>

                    <section className="checkout-panel-v2">
                        <div className="checkout-panel-head-v2">
                            <div><div className="eyebrow">PAYMENT</div><h2>Payment method</h2></div>
                        </div>
                        <div className="payment-option-v2">
                            <div className="payment-icon-v2">COD</div>
                            <div><strong>Cash on delivery</strong><span>Payment is recorded when the laundry order is completed.</span></div>
                        </div>
                    </section>
                </div>

                <aside className="checkout-panel-v2 checkout-summary-v2">
                    <div className="eyebrow">ORDER SUMMARY</div>
                    <h2>Selected services</h2>
                    <div className="checkout-items-v2">
                        {cart.map((item) => {
                            const subtotal = Number(item.weight || 0) * Number(item.price_per_kg || 0);
                            return (
                                <div className="checkout-item-v2" key={item.service_id}>
                                    <div><strong>{item.service_name}</strong><span>{Number(item.weight).toFixed(2)} kg × {formatMoney(item.price_per_kg)}/kg</span></div>
                                    <em>{formatMoney(subtotal)}</em>
                                </div>
                            );
                        })}
                    </div>
                    <div className="checkout-total-v2"><span>Total</span><strong>{formatMoney(totalAmount)}</strong></div>
                    <button className="checkout-submit-v2" type="button" onClick={onPlaceOrder} disabled={loading}>
                        {loading ? "Placing order…" : `Place order · ${formatMoney(totalAmount)}`}
                    </button>
                    <button className="checkout-back-v2" type="button" onClick={onBackToCart}>Back to cart</button>
                </aside>
            </div>
        </div>
    );
};

const PremiumOrderSuccess = ({ order, onTrackOrder, onContinueShopping }) => {
    const orderId = order?.order_id || "—";
    const weight = order?.weight != null ? `${Number(order.weight).toFixed(2)} kg` : "—";
    const total = order?.total_amount != null ? formatMoney(order.total_amount) : "—";
    const status = order?.status || "pending";

    return (
        <div className="success-page premium-page">
            <section className="success-card">
                <div className="success-check" aria-hidden="true">✓</div>
                <div className="eyebrow">ORDER CONFIRMED</div>
                <h1>Your laundry order is confirmed.</h1>
                <p className="success-lead">We've received your order. You can follow its progress from your tracking page.</p>

                <div className="success-details">
                    <div><span>Order ID</span><strong>#{orderId}</strong></div>
                    <div><span>Weight</span><strong>{weight}</strong></div>
                    <div><span>Total</span><strong>{total}</strong></div>
                    <div><span>Status</span><strong className={`status-chip status-${status}`}>{status}</strong></div>
                </div>

                <div className="success-actions">
                    <button className="button button-primary" onClick={onTrackOrder}>Track my order</button>
                    <button className="button button-secondary" onClick={onContinueShopping}>Continue shopping</button>
                </div>
            </section>
        </div>
    );
};

const PremiumTrackOrder = ({ orders, onBook }) => {
    const ordered = [...orders].sort((a, b) => Number(b.order_id) - Number(a.order_id));
    const steps = ["pending", "processing", "completed"];
    const labels = ["Order placed", "Laundry in progress", "Ready / completed"];
    const getStage = (status) => status === "completed" ? 2 : status === "processing" ? 1 : 0;
    return (
        <div className="tracking-page premium-page">
            <section className="page-heading split-heading"><div><div className="eyebrow">ORDER TRACKING</div><h1>Know where your laundry stands.</h1><p>Your tracking view follows the real status recorded for each order.</p></div>{ordered.length === 0 && <button className="button button-primary" onClick={onBook}>Book a service</button>}</section>
            {ordered.length === 0 ? <div className="tracking-empty"><div className="empty-symbol">LC</div><h2>No orders to track yet.</h2><p>Once you place an order, its progress will appear here.</p><button className="button button-primary" onClick={onBook}>Explore services</button></div> : <div className="tracking-list">{ordered.map((order) => { const stage = getStage(order.status); const cancelled = order.status === "cancelled"; return <article className="tracking-card" key={order.order_id}><div className="tracking-card-head"><div><div className="eyebrow">ORDER #{order.order_id}</div><h2>{Number(order.weight).toFixed(2)} kg laundry</h2></div><span className={`status-chip status-${order.status}`}>{order.status}</span></div><div className="tracking-summary"><span>{formatMoney(order.total_amount)}</span><span>{new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span><span>Machine {order.machine_id}</span></div>{cancelled ? <div className="cancelled-state">This order was cancelled. Please create a new order to continue.</div> : <div className="tracking-steps">{steps.map((step, index) => <div className={`tracking-step ${index <= stage ? "is-done" : ""} ${index === stage ? "is-current" : ""}`} key={step}><span className="step-dot">{index <= stage ? "✓" : index + 1}</span><div><strong>{labels[index]}</strong><small>{index === 0 ? "Your order has been received" : index === 1 ? "Your laundry is being handled" : "Your order is complete and ready for the next step"}</small></div></div>)}</div>}<div className="tracking-footer"><span>Current status</span><strong>{order.status === "pending" ? "Order received" : order.status === "processing" ? "Laundry in processing" : "Completed"}</strong></div></article>; })}</div>}
        </div>
    );
};

function App() {

    const [user, setUser] = useState(null);

    const [profile, setProfile] = useState(null);

    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [services, setServices] = useState([]);
    const [machines, setMachines] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [cart, setCart] = useState([]);
    const [lastOrder, setLastOrder] = useState(null);
    const [orderLoading, setOrderLoading] = useState(false);

    const [activePage, setActivePage] =
        useState("dashboard");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const API =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";


    /*
     * Check whether a user is already logged in.
     */

    useEffect(() => {
        checkAuthentication();
    }, []);


    const checkAuthentication = async () => {

        try {

            const response = await fetch(
                `${API}/auth/me`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {

                setUser(null);
                setLoading(false);

                return;
            }

            const data =
                await response.json();

            setUser(data.user);

            await loadUserData(
                data.user
            );

        } catch (error) {

            console.error(error);

            setUser(null);

        } finally {

            setLoading(false);
        }
    };


    /*
     * Load data depending on the logged-in user's role.
     */

    const loadUserData = async (
        currentUser
    ) => {

        try {

            setError("");


            /*
             * CUSTOMER DATA
             */

            if (
                currentUser.role ===
                "customer"
            ) {

                const [
                    profileResponse,
                    ordersResponse,
                    paymentsResponse,
                    servicesResponse
                ] = await Promise.all([

                    fetch(
                        `${API}/customers/me`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/orders/my-orders`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/payments/my-payments`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/services`,
                        {
                            credentials:
                                "include"
                        }
                    )

                ]);


                if (
                    !profileResponse.ok ||
                    !ordersResponse.ok ||
                    !paymentsResponse.ok ||
                    !servicesResponse.ok
                ) {

                    throw new Error(
                        "Failed to load customer data"
                    );
                }


                const profileData =
                    await profileResponse.json();

                const ordersData =
                    await ordersResponse.json();

                const paymentsData =
                    await paymentsResponse.json();

                const servicesData =
                    await servicesResponse.json();


                setProfile(profileData);

                setOrders(ordersData);

                setPayments(paymentsData);

                setServices(servicesData);

            }


            /*
             * ADMIN DATA
             */

            else if (
                currentUser.role ===
                "admin"
            ) {

                const [
                    customersResponse,
                    ordersResponse,
                    paymentsResponse,
                    servicesResponse,
                    machinesResponse,
                    transactionsResponse
                ] = await Promise.all([

                    fetch(
                        `${API}/customers`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/orders`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/payments`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/services`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/machines`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API}/transactions`,
                        {
                            credentials:
                                "include"
                        }
                    )

                ]);


                if (
                    !customersResponse.ok ||
                    !ordersResponse.ok ||
                    !paymentsResponse.ok ||
                    !servicesResponse.ok ||
                    !machinesResponse.ok ||
                    !transactionsResponse.ok
                ) {

                    throw new Error(
                        "Failed to load admin data"
                    );
                }


                setCustomers(
                    await customersResponse.json()
                );

                setOrders(
                    await ordersResponse.json()
                );

                setPayments(
                    await paymentsResponse.json()
                );

                setServices(
                    await servicesResponse.json()
                );

                setMachines(
                    await machinesResponse.json()
                );

                setTransactions(
                    await transactionsResponse.json()
                );
            }

        } catch (error) {

            console.error(error);

            setError(
                "Failed to load dashboard data"
            );
        }
    };


    /*
     * CART
     */

    const addToCart = (service) => {

        setCart((currentCart) => {

            const existing =
                currentCart.find(
                    (item) =>
                        item.service_id ===
                        service.service_id
                );


            if (existing) {

                return currentCart.map(
                    (item) =>
                        item.service_id ===
                        service.service_id
                            ? {
                                ...item,
                                weight:
                                    Number(
                                        item.weight
                                    ) + 1
                            }
                            : item
                );
            }


            return [
                ...currentCart,
                {
                    ...service,
                    weight: 1
                }
            ];
        });


        setActivePage("cart");
    };


    const updateCartWeight = (
        serviceId,
        weight
    ) => {

        setCart((currentCart) =>
            currentCart.map(
                (item) =>
                    item.service_id ===
                    serviceId
                        ? {
                            ...item,
                            weight:
                                Number(weight) > 0
                                    ? Number(weight)
                                    : 1
                        }
                        : item
            )
        );
    };


    const removeFromCart = (
        serviceId
    ) => {

        setCart((currentCart) =>
            currentCart.filter(
                (item) =>
                    item.service_id !==
                    serviceId
            )
        );
    };


    /*
     * CHECKOUT
     */

    const placeOrder = async () => {

        if (cart.length === 0) {
            return;
        }

        setOrderLoading(true);

        setError("");


        try {

            const response =
                await fetch(
                    `${API}/orders/checkout`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify({
                                items:
                                    cart.map(
                                        (item) => ({
                                            service_id:
                                                item.service_id,

                                            weight:
                                                Number(
                                                    item.weight
                                                )
                                        })
                                    )
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to place order"
                );
            }


            setLastOrder(
                data.order
            );

            setCart([]);

            setActivePage(
                "success"
            );

            await loadUserData(
                user
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Failed to place order"
            );

        } finally {

            setOrderLoading(false);
        }
    };


    /*
     * LOGIN
     */

    const handleLogin = async (
        loggedInUser
    ) => {

        setUser(loggedInUser);

        setActivePage(
            "dashboard"
        );

        await loadUserData(
            loggedInUser
        );
    };


    /*
     * LOGOUT
     */

    const handleLogout = async () => {

        try {

            await fetch(
                `${API}/auth/logout`,
                {
                    method: "POST",
                    credentials:
                        "include"
                }
            );

        } catch (error) {

            console.error(error);
        }


        setUser(null);

        setProfile(null);

        setCustomers([]);

        setOrders([]);

        setPayments([]);

        setServices([]);

        setMachines([]);

        setTransactions([]);

        setCart([]);

        setLastOrder(null);

        setActivePage(
            "dashboard"
        );


        /*
         * Return to public website
         */

        window.history.pushState(
            {},
            "",
            "/"
        );

        window.dispatchEvent(
            new PopStateEvent(
                "popstate"
            )
        );
    };


    /*
     * REFRESH DATA
     */

    const refreshData = async () => {

        if (user) {

            await loadUserData(
                user
            );
        }
    };


    /*
     * LOADING SCREEN
     */

    if (loading) {

        return (
            <ThemeShell className="laundry-loading-shell">
                <div className="laundry-loading-card">
                    <div className="laundry-loading-mark" />
                    <div className="laundry-brand">
                        Laundry<span>Care</span>
                    </div>
                    <p className="laundry-loading-copy">
                        Preparing your laundry experience...
                    </p>
                </div>
            </ThemeShell>
        );
    }


    /*
     * PUBLIC / AUTH ROUTING
     */

    if (!user) {

        const pathname = window.location.pathname;

        if (pathname === "/login") {
            return (
                <PremiumAuthScreen
                    mode="login"
                    selectedRole="customer"
                    onLogin={handleLogin}
                    onBack={() => { window.location.href = "/"; }}
                    onSignup={() => { window.location.href = "/signup"; }}
                />
            );
        }

        if (pathname === "/signup") {
            return (
                <PremiumAuthScreen
                    mode="signup"
                    onSignup={() => { window.location.href = "/login"; }}
                    onBackToLogin={() => { window.location.href = "/login"; }}
                />
            );
        }

        if (pathname === "/admin") {
            return (
                <PremiumAuthScreen
                    mode="login"
                    selectedRole="admin"
                    onLogin={handleLogin}
                    onBack={() => { window.location.href = "/"; }}
                />
            );
        }

        return <PremiumPublicHome />;
    }


    /*
     * PAGE TITLES
     */

    const getPageTitle = () => {

        const titles = {

            dashboard:
                user.role === "admin"
                    ? "Dashboard"
                    : "",

            profile:
                "My Profile",

            services:
                user.role === "admin"
                    ? "Services"
                    : "",

            cart:
                "Shopping Cart",

            checkout:
                "Checkout",

            success:
                "Order Confirmed",

            orders:
                user.role === "admin"
                    ? "Orders"
                    : "",

            track:
                user.role === "admin"
                    ? "Track Order"
                    : "",

            payments:
                user.role === "admin"
                    ? "Payments"
                    : "",

            customers:
                "Customers",

            machines:
                "Machines",

            transactions:
                "Transactions"
        };


        return (
            titles[activePage] ||
            ""
        );
    };


    /*
     * CUSTOMER PAGES
     */

    const renderCustomerPage = () => {

        switch (activePage) {

            case "dashboard":

                return (
                    <PremiumCustomerDashboard
                        profile={profile}
                        orders={orders}
                        payments={payments}
                        services={services}
                        onExploreServices={() =>
                            setActivePage("services")
                        }
                        onTrackOrder={() =>
                            setActivePage("track")
                        }
                    />
                );


            case "services":

                return (
                    <PremiumCustomerServices
                        services={services}
                        onAddToCart={addToCart}
                    />
                );


            case "cart":

                return (
                    <PremiumCart
                        cart={cart}
                        onUpdateWeight={updateCartWeight}
                        onRemove={removeFromCart}
                        onCheckout={() => {
                            if (cart.length > 0) {
                                setActivePage("checkout");
                            }
                        }}
                        onContinueShopping={() => setActivePage("services")}
                    />
                );


            case "checkout":

                return (
                    <PremiumCheckout
                        cart={cart}
                        profile={profile}
                        onPlaceOrder={placeOrder}
                        loading={orderLoading}
                        onBackToCart={() => setActivePage("cart")}
                        onOpenProfile={() => setActivePage("profile")}
                    />
                );


            case "success":

                return (
                    <PremiumOrderSuccess
                        order={lastOrder}
                        onTrackOrder={() => setActivePage("track")}
                        onContinueShopping={() => setActivePage("services")}
                    />
                );


            case "profile":

                return (
                    <CustomerProfile
                        profile={
                            profile
                        }
                    />
                );


            case "orders":

                return (
                    <CustomerOrders
                        orders={
                            orders
                        }
                    />
                );


            case "track":

                return (
                    <PremiumTrackOrder
                        orders={orders}
                        onBook={() => setActivePage("services")}
                    />
                );


            case "payments":

                return (
                    <CustomerPayments
                        payments={
                            payments
                        }
                    />
                );


            default:

                return (
                    <PremiumCustomerDashboard
                        profile={profile}
                        orders={orders}
                        payments={payments}
                        services={services}
                        onExploreServices={() => setActivePage("services")}
                        onTrackOrder={() => setActivePage("track")}
                    />
                );
        }
    };


    /*
     * ADMIN PAGES
     */

    const renderAdminPage = () => {

        switch (activePage) {

            case "dashboard":

                return (
                    <AdminDashboard
                        customers={
                            customers
                        }
                        orders={
                            orders
                        }
                        machines={
                            machines
                        }
                        payments={
                            payments
                        }
                    />
                );


            case "customers":

                return (
                    <Customers
                        customers={
                            customers
                        }
                        onRefresh={
                            refreshData
                        }
                    />
                );


            case "orders":

                return (
                    <AdminOrders
                        orders={
                            orders
                        }
                    />
                );


            case "services":

                return (
                    <Services
                        services={
                            services
                        }
                    />
                );


            case "machines":

                return (
                    <Machines
                        machines={
                            machines
                        }
                    />
                );


            case "payments":

                return (
                    <AdminPayments
                        payments={
                            payments
                        }
                    />
                );


            case "transactions":

                return (
                    <Transactions
                        transactions={
                            transactions
                        }
                    />
                );


            default:

                return (
                    <AdminDashboard
                        customers={
                            customers
                        }
                        orders={
                            orders
                        }
                        machines={
                            machines
                        }
                        payments={
                            payments
                        }
                    />
                );
        }
    };


    /*
     * CUSTOMER APPLICATION
     */

    if (user.role === "customer") {

        return (
            <ThemeShell className="laundry-customer-layout">
                <div className="laundry-page-transition">
                    <PremiumCustomerNavbar
                        activePage={activePage}
                        setActivePage={setActivePage}
                        onLogout={handleLogout}
                        cartCount={cart.length}
                        profile={profile}
                    />

                    {error && (
                        <div className="laundry-shell-error">
                            {error}
                        </div>
                    )}

                    <main className="laundry-customer-main">
                        {renderCustomerPage()}
                    </main>
                </div>
            </ThemeShell>
        );
    }


    /*
     * ADMIN APPLICATION
     */

    return (
        <ThemeShell className="laundry-admin-layout">
            <PremiumAdminSidebar
                activePage={activePage}
                setActivePage={setActivePage}
                onLogout={handleLogout}
                role={user.role}
            />

            <main className="laundry-admin-main">
                <PremiumAdminHeader
                    title={getPageTitle()}
                    user={user}
                    profile={profile}
                />

                {error && (
                    <div className="laundry-shell-error">
                        {error}
                    </div>
                )}

                {renderAdminPage()}
            </main>
        </ThemeShell>
    );
}

export default App;
