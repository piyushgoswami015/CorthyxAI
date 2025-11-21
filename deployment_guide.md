# Deployment Guide for Corthyx AI

This guide will walk you through deploying your full-stack application for free using **GitHub**, **Render** (Backend), **Vercel** (Frontend), and **Qdrant Cloud** (Database).

## Prerequisites

1.  **GitHub Account**: To host your code.
2.  **Render Account**: For the backend (https://render.com).
3.  **Vercel Account**: For the frontend (https://vercel.com).
4.  **Qdrant Cloud Account**: For the vector database (https://cloud.qdrant.io).

---

## Step 1: Push Code to GitHub

1.  Create a new repository on GitHub (e.g., `corthyx-ai`).
2.  Open your terminal in the project root (`simple-rag-js`) and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/corthyx-ai.git
    git push -u origin main
    ```

---

## Step 2: Set up Qdrant Cloud (Database)

1.  Log in to [Qdrant Cloud](https://cloud.qdrant.io).
2.  Create a **Free Tier Cluster**.
3.  Once created, get the **Cluster URL** (e.g., `https://xyz-example.us-east-1-0.aws.cloud.qdrant.io`) and generate an **API Key**.
4.  **Save these credentials**; you'll need them for the backend.

---

## Step 3: Deploy Backend (Render)

1.  Log in to [Render](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `corthyx-backend`
    *   **Root Directory**: `.` (leave empty or dot)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: `Free`
5.  **Environment Variables** (Advanced -> Add Environment Variable):
    *   `OPENAI_API_KEY`: Your OpenAI Key.
    *   `GOOGLE_CLIENT_ID`: Your Google Client ID.
    *   `GOOGLE_CLIENT_SECRET`: Your Google Client Secret.
    *   `SESSION_SECRET`: A random string (e.g., `supersecretkey123`).
    *   `QDRANT_URL`: Your Qdrant Cloud URL.
    *   `QDRANT_API_KEY`: Your Qdrant Cloud API Key.
    *   `PORT`: `3000` (Render usually sets this automatically, but good to have).
6.  Click **Create Web Service**.
7.  Wait for deployment. Once live, copy the **Backend URL** (e.g., `https://corthyx-backend.onrender.com`).

**Important**: Update your Google Cloud Console "Authorized Redirect URIs" to include `https://corthyx-backend.onrender.com/auth/google/callback`.

---

## Step 4: Deploy Frontend (Vercel)

1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: Click `Edit` and select `client`.
5.  **Environment Variables**:
    *   `VITE_API_URL`: The Render Backend URL from Step 3 (e.g., `https://corthyx-backend.onrender.com`).
6.  Click **Deploy**.

---

## Step 5: Final Checks

1.  Open your Vercel URL (e.g., `https://corthyx-ai.vercel.app`).
2.  Try logging in with Google.
3.  Try uploading a document and chatting.

**Note on Free Tier**: The Render free tier spins down after inactivity. The first request might take 50+ seconds to wake up. This is normal for the free plan.
