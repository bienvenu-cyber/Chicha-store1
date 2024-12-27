const mongoose = import('mongoose');

const mobilePaymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    provider: {
        type: String,
        enum: ['mtn', 'orange', 'moov'],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{8,}$/.test(v);
            },
            message: props => `${props.value} n'est pas un numéro de téléphone valide!`
        }
    },
    amount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    confirmationCode: String,
    paymentDate: Date
}, {
    timestamps: true
});

export default = mongoose.model('MobilePayment', mobilePaymentSchema);
