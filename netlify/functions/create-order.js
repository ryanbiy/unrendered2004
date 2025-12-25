// Netlify Function: Create Order
// Handles order creation, Firebase storage, and email notifications

/**
 * Netlify Function Handler
 */
export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const orderData = JSON.parse(event.body);

        // Validate required fields
        const requiredFields = ['customer', 'items', 'total'];
        for (const field of requiredFields) {
            if (!orderData[field]) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: `Missing required field: ${field}` })
                };
            }
        }

        // Validate customer fields
        const requiredCustomerFields = ['name', 'email', 'phone', 'address', 'city'];
        for (const field of requiredCustomerFields) {
            if (!orderData.customer[field]) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: `Missing customer field: ${field}` })
                };
            }
        }

        console.log('Creating order:', {
            customer: orderData.customer.name,
            items: orderData.items.length,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod
        });

        // NOTE: Firebase operations should be done on the client side
        // This function is mainly for validation and can trigger additional
        // backend-only operations if needed

        // Return success
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Order validated successfully',
                data: {
                    customer: orderData.customer.name,
                    total: orderData.total
                }
            })
        };

    } catch (error) {
        console.error('Error creating order:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to create order'
            })
        };
    }
}
