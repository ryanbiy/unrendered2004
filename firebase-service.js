// Firebase Service Layer
// Handles all Firebase Realtime Database operations for orders

import { database, ref, push, set, onValue, get, update, remove } from './firebase-config.js';

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXXX
 */
function generateOrderNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
}

/**
 * Create a new order in Firebase
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Created order with ID
 */
export async function createOrder(orderData) {
    try {
        const ordersRef = ref(database, 'orders');
        const newOrderRef = push(ordersRef);

        const order = {
            orderNumber: generateOrderNumber(),
            date: new Date().toISOString(),
            customer: {
                name: orderData.customer.name,
                email: orderData.customer.email,
                phone: orderData.customer.phone,
                address: orderData.customer.address,
                city: orderData.customer.city,
                postalCode: orderData.customer.postalCode
            },
            items: orderData.items,
            total: orderData.total,
            status: 'pending', // pending, processing, shipped, delivered, cancelled
            paymentStatus: 'pending', // pending, paid, failed
            paymentMethod: orderData.paymentMethod || 'cod', // mpesa, cod
            mpesaReceiptNumber: '',
            mpesaTransactionId: '',
            notes: orderData.notes || ''
        };

        await set(newOrderRef, order);

        return {
            id: newOrderRef.key,
            ...order
        };
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
    }
}

/**
 * Get all orders (for admin dashboard)
 * @param {Function} callback - Called when orders update
 */
export function listenToOrders(callback) {
    const ordersRef = ref(database, 'orders');

    onValue(ordersRef, (snapshot) => {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
            orders.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Sort by date (newest first)
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));

        callback(orders);
    }, (error) => {
        console.error('Error listening to orders:', error);
        callback([]);
    });
}

/**
 * Get a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export async function getOrder(orderId) {
    try {
        const orderRef = ref(database, `orders/${orderId}`);
        const snapshot = await get(orderRef);

        if (snapshot.exists()) {
            return {
                id: orderId,
                ...snapshot.val()
            };
        } else {
            throw new Error('Order not found');
        }
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 */
export async function updateOrderStatus(orderId, status) {
    try {
        const orderRef = ref(database, `orders/${orderId}`);
        await update(orderRef, { status });
        console.log(`✅ Order ${orderId} status updated to: ${status}`);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

/**
 * Update payment status and M-Pesa details
 * @param {string} orderId - Order ID
 * @param {Object} paymentData - Payment information
 */
export async function updatePaymentStatus(orderId, paymentData) {
    try {
        const orderRef = ref(database, `orders/${orderId}`);
        await update(orderRef, {
            paymentStatus: paymentData.status,
            mpesaReceiptNumber: paymentData.receiptNumber || '',
            mpesaTransactionId: paymentData.transactionId || '',
            paidAt: paymentData.status === 'paid' ? new Date().toISOString() : null
        });
        console.log(`✅ Payment status updated for order ${orderId}`);
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
}

/**
 * Delete an order
 * @param {string} orderId - Order ID
 */
export async function deleteOrder(orderId) {
    try {
        const orderRef = ref(database, `orders/${orderId}`);
        await remove(orderRef);
        console.log(`✅ Order ${orderId} deleted`);
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
}

/**
 * Get order statistics for admin dashboard
 * @returns {Promise<Object>} Statistics
 */
export async function getOrderStats() {
    try {
        const ordersRef = ref(database, 'orders');
        const snapshot = await get(ordersRef);

        let totalOrders = 0;
        let totalRevenue = 0;
        let pendingOrders = 0;
        let completedOrders = 0;

        snapshot.forEach((childSnapshot) => {
            const order = childSnapshot.val();
            totalOrders++;

            if (order.paymentStatus === 'paid') {
                totalRevenue += order.total;
            }

            if (order.status === 'pending' || order.status === 'processing') {
                pendingOrders++;
            } else if (order.status === 'delivered') {
                completedOrders++;
            }
        });

        return {
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders
        };
    } catch (error) {
        console.error('Error getting order stats:', error);
        return {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            completedOrders: 0
        };
    }
}
