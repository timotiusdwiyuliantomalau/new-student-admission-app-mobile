// Install package yang dibutuhkan:
// npm install express midtrans-client dotenv cors

import "dotenv/config";
import express from 'express';
import cors from 'cors';
import midtransClient from 'midtrans-client';

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Route untuk membuat transaksi baru
app.post('/api/create-transaction', async (req, res) => {
    try {
        const { 
            order_id,
            gross_amount,
            customer_details,
            item_details 
        } = req.body;

        const parameter = {
            transaction_details: {
                order_id,
                gross_amount
            },
            customer_details,
            item_details,
            credit_card: {
                secure: true
            }
        };

        const transaction = await snap.createTransaction(parameter);
        const transactionToken = transaction.token;

        res.json({
            status: 'success',
            message: 'Transaction token created',
            data: {
                token: transactionToken,
                redirect_url: transaction.redirect_url
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create transaction'
        });
    }
});

// Route untuk handle notification dari Midtrans
app.post('/api/notification', async (req, res) => {
    try {
        const notification = await snap.transaction.notification(req.body);
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        // Sample usage of handling different transaction status
        switch (transactionStatus) {
            case 'capture':
                if (fraudStatus == 'challenge') {
                    // TODO: handle challenge transaction
                } else if (fraudStatus == 'accept') {
                    // TODO: handle success transaction
                }
                break;
            case 'settlement':
                // TODO: handle success transaction
                break;
            case 'deny':
                // TODO: handle deny transaction
                break;
            case 'cancel':
            case 'expire':
                // TODO: handle expired transaction
                break;
            case 'pending':
                // TODO: handle pending transaction
                break;
        }

        // Return 200 OK
        res.status(200).json({
            status: 'success',
            message: 'Notification processed'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process notification'
        });
    }
});

// Route untuk check status transaksi
app.get('/api/transaction-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const transactionStatus = await snap.transaction.status(orderId);
        
        res.json({
            status: 'success',
            data: transactionStatus
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check transaction status'
        });
    }
});

// Buat file .env untuk menyimpan credentials
/*
MIDTRANS_SERVER_KEY=YOUR_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_CLIENT_KEY
PORT=3000
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});