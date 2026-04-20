import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    variantIndex: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, { timestamps: true });

const cartModel = mongoose.model('cart', cartSchema);

export default cartModel;
