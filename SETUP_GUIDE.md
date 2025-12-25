# biy Clothing Store - Backend Setup Guide

This guide will walk you through setting up Firebase, EmailJS, M-Pesa, and deploying to Netlify.

## Prerequisites

- Node.js installed (download from [nodejs.org](https://nodejs.org))
- Git installed
- A GitHub account (for deploying to Netlify)

---

## Phase 1: Firebase Setup (15 minutes)

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `biy-clothing-store` (or your preferred name)
4. **Disable** Google Analytics (optional for this project)
5. Click **"Create project"** and wait for it to finish

### 1.2 Enable Realtime Database

1. In your Firebase project, click **"Build"** in the left sidebar
2. Click **"Realtime Database"**
3. Click **"Create Database"**
4. Choose location: **us-central1** (or closest to you)
5. Start in **"Test mode"** (we'll secure it later)
6. Click **"Enable"**

### 1.3 Get Firebase Configuration

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** `</>`
5. Register app with nickname: **"biy-web"**
6. **Copy the configuration object** - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 1.4 Update Security Rules (Important!)

1. Go back to **Realtime Database**
2. Click the **"Rules"** tab
3. Replace the rules with:

```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. Click **"Publish"**

> **Note**: These rules allow anyone to read/write. For production, you should add authentication.

---

## Phase 2: EmailJS Setup (10 minutes)

### 2.1 Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com)
2. Click **"Sign Up"** (it's free!)
3. Verify your email address

### 2.2 Add Email Service

1. Go to **"Email Services"** in the dashboard
2. Click **"Add New Service"**
3. Choose your email provider (Gmail recommended)
4. Follow the connection steps
5. **Copy the Service ID** (e.g., `service_abc123`)

### 2.3 Create Email Templates

You need to create 4 templates:

#### Template 1: Admin Order Notification

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. **Template ID**: `admin_order_notification`
4. **Subject**: `New Order #{{order_number}} - {{customer_name}}`
5. **Content**:

```
New order received!

Order Number: {{order_number}}
Customer: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}
Total: KES {{total}}

Items:
{{items_list}}

Shipping Address:
{{address}}

View in admin dashboard: {{admin_link}}
```

6. Click **"Save"**

#### Template 2: Customer Order Confirmation

1. Create another template
2. **Template ID**: `customer_order_confirmation`
3. **Subject**: `Order Confirmation #{{order_number}} - biy`
4. **Content**:

```
Hi {{customer_name}},

Thank you for your order!

Order Number: {{order_number}}
Order Date: {{order_date}}
Total: KES {{total}}

Items Ordered:
{{items_list}}

Shipping Address:
{{address}}

Payment Method: {{payment_method}}

We'll send you another email when your order ships.

Questions? Reply to this email or contact us at support@biy.com

- The biy Team
```

5. Click **"Save"**

#### Template 3: Payment Confirmation

1. **Template ID**: `payment_confirmation`
2. **Subject**: `Payment Received - Order #{{order_number}}`
3. **Content**:

```
Hi {{customer_name}},

Your payment has been received!

Order Number: {{order_number}}
Amount Paid: KES {{total}}
Payment Method: {{payment_method}}
M-Pesa Receipt: {{receipt_number}}
Transaction ID: {{transaction_id}}
Payment Date: {{payment_date}}

Your order is now being processed.

Thank you!
- The biy Team
```

#### Template 4: Order Shipped

1. **Template ID**: `order_shipped`
2. **Subject**: `Your Order Has Shipped! #{{order_number}}`
3. **Content**:

```
Hi {{customer_name}},

Great news! Your order has shipped!

Order Number: {{order_number}}
Tracking Number: {{tracking_number}}
Estimated Delivery: {{estimated_delivery}}

Items:
{{items_list}}

Thank you for shopping with biy!
```

### 2.4 Get EmailJS Credentials

1. Go to **"Account"** > **"General"**
2. **Copy your Public Key** (e.g., `user_abc123xyz`)
3. Keep your Service ID and Template IDs handy

---

## Phase 3: M-Pesa Daraja Setup (20 minutes)

### 3.1 Create Daraja Account

1. Go to [Daraja Portal](https://developer.safaricom.co.ke)
2. Click **"Sign Up"**
3. Fill in your details and verify email
4. Log in to the portal

### 3.2 Create Sandbox App

1. Click **"My Apps"**
2. Click **"Add a New App"**
3. App Name: **"biy Store"**
4. Select **"Lipa Na M-Pesa Online"** (STK Push)
5. Click **"Create App"**

### 3.3 Get Credentials

1. Click on your app
2. **Copy these values**:
   - **Consumer Key**
   - **Consumer Secret**
3. Go to **"Test Credentials"** tab
4. **Copy**:
   - **Shortcode**: Usually `174379` for sandbox
   - **Passkey**: Long string starting with `bfb279f9aa9bdbcf...`

### 3.4 Test Phone Numbers

For sandbox testing, use these test phone numbers:
- `254708374149`
- `254711111111`

> **Note**: Real M-Pesa integration requires business registration and Safaricom approval.

---

## Phase 4: Configure Environment Variables

### 4.1 Create .env File

1. In your project root, copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

2. Open `.env` and fill in your credentials:

```env
# Firebase
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# EmailJS
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_PUBLIC_KEY=user_xyz789

# Email Templates
VITE_EMAILJS_ADMIN_TEMPLATE=admin_order_notification
VITE_EMAILJS_CUSTOMER_TEMPLATE=customer_order_confirmation
VITE_EMAILJS_PAYMENT_TEMPLATE=payment_confirmation
VITE_EMAILJS_SHIPPING_TEMPLATE=order_shipped

# Admin Email
VITE_ADMIN_EMAIL=biyclothingstore@gmail.com

# M-Pesa (Sandbox)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=bfb279f9aa9bdbcf...
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox
```

3. **Save the file**

> **IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

---

## Phase 5: Install Dependencies

Open terminal in your project folder and run:

```bash
npm install
```

This will install:
- Firebase SDK
- EmailJS
- Axios
- Netlify CLI

---

## Phase 6: Deploy to Netlify

### 6.1 Create Netlify Account

1. Go to [Netlify](https://www.netlify.com)
2. Sign up with GitHub

### 6.2 Deploy Your Site

#### Option A: Using Netlify CLI (Recommended)

1. Login to Netlify:

```bash
npx netlify login
```

2. Initialize your site:

```bash
npx netlify init
```

3. Follow the prompts:
   - Create & configure a new site
   - Team: Your team
   - Site name: `biy-clothing-store` (or your choice)
   - Build command: (leave empty)
   - Directory to deploy: `merch`
   - Netlify functions folder: `netlify/functions`

4. Deploy:

```bash
npx netlify deploy --prod
```

#### Option B: Using Netlify Dashboard

1. Push your code to GitHub
2. Go to Netlify dashboard
3. Click **"Add new site"** > **"Import an existing project"**
4. Choose GitHub and select your repository
5. Configure:
   - Build command: (leave empty)
   - Publish directory: `merch`
   - Functions directory: `netlify/functions`
6. Click **"Deploy site"**

### 6.3 Add Environment Variables to Netlify

1. Go to your site in Netlify dashboard
2. Click **"Site settings"** > **"Environment variables"**
3. Click **"Add a variable"**
4. Add ALL variables from your `.env` file (one by one):
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: `AIza...`
   - Repeat for all variables

5. Click **"Save"**

### 6.4 Update Callback URL

1. Copy your Netlify site URL (e.g., `https://biy-clothing-store.netlify.app`)
2. Update `.env` with:

```env
MPESA_CALLBACK_URL=https://your-site.netlify.app/.netlify/functions/mpesa-callback
```

3. Update this in Netlify environment variables too
4. Redeploy:

```bash
npx netlify deploy --prod
```

---

## Phase 7: Testing

### 7.1 Test Locally

```bash
npm run dev
```

Visit `http://localhost:8888`

### 7.2 Test Order Flow

1. Add items to cart
2. Go to checkout
3. Fill in details
4. Select payment method
5. Submit order
6. Check:
   - Firebase Realtime Database for order
   - Your email for notifications
   - Admin dashboard for order display

### 7.3 Test M-Pesa (Sandbox)

1. Use test phone number: `254708374149`
2. When STK push appears, enter PIN: `1234`
3. Payment should complete

---

## Troubleshooting

### Firebase not connecting
- Check that all Firebase config values are correct
- Ensure database rules allow read/write
- Check browser console for errors

### Emails not sending
- Verify EmailJS service is connected
- Check template IDs match exactly
- Ensure public key is correct
- Check EmailJS dashboard for failed sends

### M-Pesa not working
- Ensure you're using sandbox environment
- Use test phone numbers only
- Check Netlify function logs for errors
- Verify all M-Pesa credentials are correct

### Netlify Functions failing
- Check environment variables are set in Netlify
- View function logs in Netlify dashboard
- Ensure all dependencies are in `package.json`

---

## Next Steps

1. **Test everything thoroughly** in sandbox mode
2. **Add admin authentication** to protect admin dashboard
3. **Customize email templates** with your branding
4. **Apply for M-Pesa production** when ready to go live
5. **Add Firebase security rules** for production

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Netlify function logs
3. Verify all credentials are correct
4. Ensure environment variables are set

---

## Production Checklist

Before going live:

- [ ] Test all order flows
- [ ] Test email notifications
- [ ] Test M-Pesa payments (sandbox)
- [ ] Add Firebase authentication
- [ ] Update Firebase security rules
- [ ] Apply for M-Pesa production credentials
- [ ] Set up custom domain
- [ ] Add SSL certificate (automatic with Netlify)
- [ ] Test on mobile devices
- [ ] Set up order backup system

---

**Congratulations!** Your biy clothing store backend is now set up! 🎉
