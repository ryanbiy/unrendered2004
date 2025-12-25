// Email Service using EmailJS
// Handles all email notifications for the biy clothing store

import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@biy.com';

// Template IDs
const TEMPLATES = {
    ADMIN_NOTIFICATION: import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE || 'admin_order_notification',
    CUSTOMER_CONFIRMATION: import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE || 'customer_order_confirmation',
    PAYMENT_CONFIRMATION: import.meta.env.VITE_EMAILJS_PAYMENT_TEMPLATE || 'payment_confirmation',
    SHIPPING_NOTIFICATION: import.meta.env.VITE_EMAILJS_SHIPPING_TEMPLATE || 'order_shipped'
};

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✅ EmailJS initialized');
} else {
    console.warn('⚠️ EmailJS public key not found');
}

/**
 * Format items list for email
 */
function formatItemsList(items) {
    return items.map(item =>
        `- ${item.name} (Size: ${item.size}) x${item.quantity} - KES ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
}

/**
 * Format address for email
 */
function formatAddress(customer) {
    return `${customer.address}\n${customer.city}, ${customer.postalCode}`;
}

/**
 * Send admin order notification
 * @param {Object} order - Order data
 */
export async function sendAdminNotification(order) {
    try {
        const templateParams = {
            to_email: ADMIN_EMAIL,
            order_number: order.orderNumber,
            customer_name: order.customer.name,
            customer_email: order.customer.email,
            customer_phone: order.customer.phone,
            total: order.total.toFixed(2),
            items_list: formatItemsList(order.items),
            address: formatAddress(order.customer),
            payment_method: order.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery',
            order_date: new Date(order.date).toLocaleString(),
            admin_link: `${window.location.origin}/merch/admin.html`
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATES.ADMIN_NOTIFICATION,
            templateParams
        );

        console.log('✅ Admin notification sent:', response.status);
        return response;
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error);
        throw error;
    }
}

/**
 * Send customer order confirmation
 * @param {Object} order - Order data
 */
export async function sendCustomerConfirmation(order) {
    try {
        const templateParams = {
            to_email: order.customer.email,
            customer_name: order.customer.name,
            order_number: order.orderNumber,
            order_date: new Date(order.date).toLocaleDateString(),
            total: order.total.toFixed(2),
            items_list: formatItemsList(order.items),
            address: formatAddress(order.customer),
            payment_method: order.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATES.CUSTOMER_CONFIRMATION,
            templateParams
        );

        console.log('✅ Customer confirmation sent:', response.status);
        return response;
    } catch (error) {
        console.error('❌ Failed to send customer confirmation:', error);
        throw error;
    }
}

/**
 * Send payment confirmation email
 * @param {Object} order - Order data
 */
export async function sendPaymentConfirmation(order) {
    try {
        const templateParams = {
            to_email: order.customer.email,
            customer_name: order.customer.name,
            order_number: order.orderNumber,
            total: order.total.toFixed(2),
            payment_method: 'M-Pesa',
            receipt_number: order.mpesaReceiptNumber,
            transaction_id: order.mpesaTransactionId,
            payment_date: new Date().toLocaleDateString()
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATES.PAYMENT_CONFIRMATION,
            templateParams
        );

        console.log('✅ Payment confirmation sent:', response.status);
        return response;
    } catch (error) {
        console.error('❌ Failed to send payment confirmation:', error);
        throw error;
    }
}

/**
 * Send shipping notification
 * @param {Object} order - Order data
 * @param {string} trackingNumber - Optional tracking number
 */
export async function sendShippingNotification(order, trackingNumber = '') {
    try {
        const templateParams = {
            to_email: order.customer.email,
            customer_name: order.customer.name,
            order_number: order.orderNumber,
            items_list: formatItemsList(order.items),
            tracking_number: trackingNumber,
            estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() // 3 days from now
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATES.SHIPPING_NOTIFICATION,
            templateParams
        );

        console.log('✅ Shipping notification sent:', response.status);
        return response;
    } catch (error) {
        console.error('❌ Failed to send shipping notification:', error);
        throw error;
    }
}

/**
 * Send all order notifications (admin + customer)
 * @param {Object} order - Order data
 */
export async function sendOrderNotifications(order) {
    const results = {
        admin: null,
        customer: null,
        errors: []
    };

    try {
        results.admin = await sendAdminNotification(order);
    } catch (error) {
        results.errors.push({ type: 'admin', error });
    }

    try {
        results.customer = await sendCustomerConfirmation(order);
    } catch (error) {
        results.errors.push({ type: 'customer', error });
    }

    return results;
}
