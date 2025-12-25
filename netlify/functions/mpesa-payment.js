// Netlify Function: M-Pesa STK Push
// Initiates M-Pesa payment request to customer's phone

import axios from 'axios';

/**
 * Get M-Pesa OAuth token
 */
async function getAccessToken() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const url = environment === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with M-Pesa');
    }
}

/**
 * Generate M-Pesa password
 */
function generatePassword(shortcode, passkey, timestamp) {
    const data = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
}

/**
 * Netlify Function Handler
 */
export async function handler(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { phoneNumber, amount, orderId, accountReference } = JSON.parse(event.body);

        // Validate input
        if (!phoneNumber || !amount || !orderId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Format phone number (remove + and spaces, ensure it starts with 254)
        let formattedPhone = phoneNumber.replace(/[\s+]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        // Get M-Pesa credentials
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;
        const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

        // Generate timestamp and password
        const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').substring(0, 14);
        const password = generatePassword(shortcode, passkey, timestamp);

        // Get access token
        const accessToken = await getAccessToken();

        // Prepare STK Push request
        const stkPushUrl = environment === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        const stkPushData = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.ceil(amount), // M-Pesa requires integer
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: accountReference || orderId,
            TransactionDesc: `Payment for order ${orderId}`
        };

        console.log('Initiating STK Push:', {
            phone: formattedPhone,
            amount: Math.ceil(amount),
            orderId
        });

        // Send STK Push request
        const response = await axios.post(stkPushUrl, stkPushData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('STK Push response:', response.data);

        // Return success response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'STK Push sent successfully',
                data: {
                    merchantRequestId: response.data.MerchantRequestID,
                    checkoutRequestId: response.data.CheckoutRequestID,
                    responseCode: response.data.ResponseCode,
                    responseDescription: response.data.ResponseDescription,
                    customerMessage: response.data.CustomerMessage
                }
            })
        };

    } catch (error) {
        console.error('M-Pesa payment error:', error.response?.data || error.message);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.response?.data?.errorMessage || error.message || 'Payment initiation failed'
            })
        };
    }
}
