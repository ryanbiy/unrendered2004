// Netlify Function: M-Pesa Callback Handler
// Receives payment confirmation from M-Pesa and updates order status

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
        const callbackData = JSON.parse(event.body);

        console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

        // Extract callback data
        const { Body } = callbackData;
        const { stkCallback } = Body;

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc
        } = stkCallback;

        // Check if payment was successful
        if (ResultCode === 0) {
            // Payment successful
            const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

            // Extract payment details
            const amount = callbackMetadata.find(item => item.Name === 'Amount')?.Value;
            const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
            const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
            const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;

            console.log('✅ Payment successful:', {
                amount,
                mpesaReceiptNumber,
                transactionDate,
                phoneNumber,
                merchantRequestID: MerchantRequestID,
                checkoutRequestID: CheckoutRequestID
            });

            // TODO: Update Firebase order status
            // This would require importing Firebase Admin SDK
            // For now, we'll just log the success
            // In production, you would:
            // 1. Find order by CheckoutRequestID
            // 2. Update payment status to 'paid'
            // 3. Add M-Pesa receipt number
            // 4. Trigger email notification

            return {
                statusCode: 200,
                body: JSON.stringify({
                    ResultCode: 0,
                    ResultDesc: 'Success'
                })
            };

        } else {
            // Payment failed
            console.log('❌ Payment failed:', {
                resultCode: ResultCode,
                resultDesc: ResultDesc,
                merchantRequestID: MerchantRequestID,
                checkoutRequestID: CheckoutRequestID
            });

            // TODO: Update order status to 'payment_failed'

            return {
                statusCode: 200,
                body: JSON.stringify({
                    ResultCode: 0,
                    ResultDesc: 'Callback received'
                })
            };
        }

    } catch (error) {
        console.error('Error processing M-Pesa callback:', error);

        // Always return 200 to M-Pesa to acknowledge receipt
        return {
            statusCode: 200,
            body: JSON.stringify({
                ResultCode: 1,
                ResultDesc: 'Error processing callback'
            })
        };
    }
}
