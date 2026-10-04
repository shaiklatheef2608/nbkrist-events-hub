# 🎓 NBKRIST Events Hub

An advanced, high-fidelity collegiate events management portal designed specifically for **N.B.K.R. Institute of Science and Technology (NBKRIST)**. Built with **React**, **Vite**, **Tailwind CSS**, and **Firebase (Firestore, Authentication, and Hosting)**.

This portal serves as the unified digital hub where institutional departments and active student chapters publish technical symposia, hackathons, guest lectures, and workshops, while students seamlessly browse, search, and register.

---

## 🚀 Key Features

### 🏢 Department & Host Portal
* **Verified Whitelisted Registration**: Organizers can register and activate accounts using pre-approved `@nbkrist.org` institutional emails.
* **Automatic Organization Routing**: Realtime lookup maps registered emails (e.g. `csenbkrist@nbkrist.org`) to their authorized title (e.g. `CSE Department`) on signup.
* **Full Event Lifecycle Management**: Write, edit, save drafts, publish, and toggle registration states (open, closed, completed, cancelled).
* **Compulsory Poster Image Integration**: Every event must feature a high-fidelity poster URL linked through a clickable helper to [uploadimgur.com](https://uploadimgur.com/).

### 🧭 Student & Public Interface
* **Advanced Multi-Criteria Search**: Instantly filter collegiate activities by text keywords, specific department hosts, classification type, and dates.
* **Native Calendar Date Picker**: Choose dates and set registration deadlines seamlessly using interactive native calendar pickers.
* **Show/Hide Password Safety**: Enhanced user login and signup passwords feature high-visibility toggles for seamless accuracy.
* **Institutional Domain Reset Shield**: Direct self-service password reset is restricted. Users are securely routed to contact the institutional domain administrator: `abdullatheefshaik4o@gmail.com`.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
* **Database & Auth**: Google Firebase (Firestore DB & Firebase Authentication)
* **Design Pattern**: Zero-Trust Security Rules, Responsive Grid Layout, Neural Network Canvas Background Animations.

---

## 🛡️ Zero-Trust Security Architecture (`firestore.rules`)

* **Default-Deny Catch All**: All read/write requests are locked out by default unless explicitly permitted.
* **Draft Leak Protection**: Draft events are mathematically restricted from public read/list queries. Only the original host creator or `isSuperAdmin` can view draft documents.
* **Type & Length Validation**: Inputs are heavily sanitized on the database level (e.g. title size $[3, 200]$, compulsory poster URLs validated for string length and protocol format).
* **Null-Pointer Prevention**: Advanced verification checks for active emails before execution, protecting the database engine from Denial of Wallet or resource exploits.

---

## 📦 Project Setup

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** or **bun** installed.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/nbkrist-events-hub.git

# Navigate into project directory
cd nbkrist-events-hub

# Install all dependencies
npm install
```

### 3. Setup Firebase Config
Create a `firebase-applet-config.json` file in the root folder with your Firebase app credentials:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

### 4. Running Local Dev Server
```bash
# Launch development environment on port 3000
npm run dev
```

### 5. Build for Production
```bash
# Compile and build the optimized production assets
npm run build
```

---

## 🔗 Institutional Administration
* **Domain Administrator Email**: `abdullatheefshaik4o@gmail.com`
* **Institutuion**: N.B.K.R. Institute of Science and Technology (NBKRIST), Autonomous, Estd. 1979.
