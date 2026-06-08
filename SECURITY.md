# Security Policy

This document outlines the security architecture, API key storage guidelines, and safe practices for the **Todfeed** application.

---

## 🔒 API Key & Data Isolation

Todfeed is designed as a **serverless, client-side-only application**. This choice provides the highest level of privacy and data security for parents.

### 1. Client-Side API Key Storage
*   **Storage Location:** Your Gemini API Key is stored strictly in your browser's local storage (`localStorage.getItem('gemini_api_key')`).
*   **Transmission:** The key is sent directly from your browser to Google's official Gemini API endpoint (`https://generativelanguage.googleapis.com/`).
*   **No Intermediaries:** Todfeed does **not** have a backend server, database, or analytics tracker. Your API key is never transmitted to any third party, logged, or tracked.

### 2. Personal Baby Data Privacy
*   All information entered in the Baby Profile (name, age, allergies, country) and your logged feed routines is stored strictly on your local device. 
*   No personal data or nutritional logs are uploaded to any cloud server. When generating recipes, only the age, country, ingredients, and diet restrictions are sent to the Gemini API to construct the prompt. The baby's name is **not** transmitted.

---

## 🛠️ Security Best Practices for Developers

If you are hosting or deploying Todfeed yourself, follow these guidelines to keep the application secure:

### 1. Avoid Committing Keys
*   Never hardcode or check in your Google Gemini API Key to this repository.
*   The `.gitignore` is pre-configured to ignore all `.local` files (like `.env.local`), which can be used to hold local environment credentials during testing.

### 2. Content Security Policy (CSP)
When deploying Todfeed to a production domain, it is recommended to configure a Content Security Policy (CSP) header. This restricts the domains that the browser can connect to, preventing cross-site scripting (XSS) attacks from stealing keys.

Example CSP directives:
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com/; img-src 'self' data:;
```

---

## 🚨 Reporting Vulnerabilities

If you discover a security vulnerability within this project, please open an issue in the repository or contact the project maintainer directly. 

**Do not post active API keys or credentials in public GitHub issues.** If you accidentally commit an API key, revoke it immediately via the [Google AI Studio Console](https://aistudio.google.com/).
