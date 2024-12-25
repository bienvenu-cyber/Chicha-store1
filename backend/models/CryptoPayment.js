import mongoose from 'mongoose';

const cryptoPaymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    cryptocurrency: {
        type: String,
        enum: ['BTC', 'ETH', 'USDT', 'BNB'],
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    amountCrypto: {
        type: Number,
        required: true
    },
    amountFiat: {
        type: Number,
        required: true
    },
    exchangeRate: {
        type: Number,
        required: true
    },
    transactionHash: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirming', 'completed', 'failed'],
        default: 'pending'
    },
    confirmations: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('CryptoPayment', cryptoPaymentSchema);
