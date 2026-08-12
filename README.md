# Goat feed management and Live stock tracker

# Node.js, npm, Express, and PM2 Installation Guide (Ubuntu)

## Overview

This guide covers the installation and setup of the following components on an Ubuntu system:

- Node.js (LTS Version)
- npm (Node Package Manager)
- Express.js
- SQLite3
- Multer
- CORS
- PM2 Process Manager

This setup can be used as the backend environment for applications such as the Goat Stock Tracker.

---

## 1. Update the System

Update package information and install the latest available updates.

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 2. Install Prerequisite Packages

Install common utilities required for development.

```bash
sudo apt install -y curl wget git build-essential
```

Verify installations:

```bash
curl --version
git --version
gcc --version
```

---

## 3. Install Node.js (LTS Version)

Add the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
```

Install Node.js:

```bash
sudo apt install -y nodejs
```

---

## 4. Verify Node.js and npm Installation

Check Node.js version:

```bash
node -v
```

Example:

```text
v22.x.x
```

Check npm version:

```bash
npm -v
```

Example:

```text
10.x.x
```

---

## 5. Create the Project Directory

```bash
mkdir GoatStockTracker
cd GoatStockTracker
```

---

## 6. Initialize npm Project

Create a package.json file:

```bash
npm init -y
```

This creates:

```text
GoatStockTracker/
└── package.json
```

---

## 7. Install Backend Dependencies

Install Express and supporting libraries.

```bash
npm install express cors multer sqlite3
```

### Package Purpose

| Package | Purpose |
|----------|----------|
| express | Web server framework |
| cors | Cross-Origin Resource Sharing |
| multer | File upload handling |
| sqlite3 | SQLite database support |

---

## 8. Verify Installed Packages

```bash
npm list --depth=0
```

Expected output:

```text
express
cors
multer
sqlite3
```

---

## 9. Install PM2

PM2 keeps the Node.js application running and automatically restarts it after system reboots.

Install globally:

```bash
sudo npm install -g pm2
```

Verify:

```bash
pm2 -v
```

---

## 10. Run the Application

Start the Express server normally:

```bash
node server.js
```

Expected output:

```text
Server running on http://localhost:3000
```

---

## 11. Run the Application Using PM2

Start the server:

```bash
pm2 start server.js --name GoatStockTracker
```

Check status:

```bash
pm2 status
```

View logs:

```bash
pm2 logs GoatStockTracker
```

Restart application:

```bash
pm2 restart GoatStockTracker
```

Stop application:

```bash
pm2 stop GoatStockTracker
```

Delete application:

```bash
pm2 delete GoatStockTracker
```

---

## 12. Enable PM2 Auto Start

Generate startup configuration:

```bash
pm2 startup
```

Execute the command printed by PM2.

Save the current PM2 configuration:

```bash
pm2 save
```

Verify:

```bash
pm2 list
```

---

## 13. Test the Backend API

Check local API access:

```bash
curl http://localhost:3000/api/expenses
```

Expected output:

```json
[]
```

If data exists:

```json
[
  {
    "id": 1,
    "name": "Fuel",
    "amount": 1500
  }
]
```

---

## 14. Verify Port Listening

Check whether Express is listening on port 3000:

```bash
ss -tulpn | grep 3000
```

Expected output:

```text
LISTEN 0 511 *:3000
```

---

## 15. Useful npm Commands

Install a package:

```bash
npm install <package-name>
```

Remove a package:

```bash
npm uninstall <package-name>
```

Install all dependencies from package.json:

```bash
npm install
```

Update packages:

```bash
npm update
```

Display installed pack*ges:

```bash
npm list*--depth=0
```

---

## Project Str*cture Example

```text
GoatStockTr*cker/
│
├──*public/
│   ├── index.html
│  *├── style.css
│   └── script.js
│
**─ Server/
│   ├── server.js
│* *├── database.js
│   ├── package*json
│   └── node_modules/
│
└*─*README.md
```

---

##*One*Line Installation Command

For a*fresh Ubuntu system:

```bash
sudo*apt update && \
sudo apt*install -* curl wget git build-essential && *
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &* \
sudo apt install -y nodejs && \*sudo npm install -g pm2
```

---

*# Next Steps

After verifying*the backend locally:

1.*Configure*SQLite database.
2. Validate*file*uploads using Multer.
3. Configure*PM2 auto-start.
4. Install and*configure Cloudflare*Tunnel.
5. Map a*custom*domain (optional).
6. Enable HTTPS*access through Cloudflare.
````*