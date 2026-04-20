import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

export const addToCart = async (req, res) => {
    const { productId, variantIndex = 0, quantity = 1 } = req.body;

    try {
        const product = await productModel.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Check stock
        const variant = product.variants[variantIndex] || { stock: product.stock || 0 }; // Fallback if no variants
        const availableStock = variant.stock;

        if (availableStock < quantity) {
            return res.status(400).json({ 
                message: "Insufficient stock", 
                availableStock 
            });
        }

        let cart = await cartModel.findOne({ user: req.user._id });

        if (!cart) {
            cart = await cartModel.create({
                user: req.user._id,
                items: [{ product: productId, variantIndex, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => 
                item.product.toString() === productId && item.variantIndex === variantIndex
            );

            if (itemIndex > -1) {
                const newQuantity = cart.items[itemIndex].quantity + quantity;
                if (newQuantity > 10) {
                    return res.status(400).json({ message: "Max quantity per product is 10" });
                }
                if (newQuantity > availableStock) {
                    return res.status(400).json({ message: "Insufficient stock for total quantity", availableStock });
                }
                cart.items[itemIndex].quantity = newQuantity;
            } else {
                if (cart.items.length >= 20) { // Optional limit on unique items
                    return res.status(400).json({ message: "Cart is full" });
                }
                cart.items.push({ product: productId, variantIndex, quantity });
            }
            await cart.save();
        }

        res.status(200).json({ message: "Added to cart", cart });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const cart = await cartModel.findOne({ user: req.user._id })
            .populate('items.product');
        
        if (!cart) return res.status(200).json({ items: [] });
        
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    const { productId, variantIndex, quantity } = req.body;

    if (quantity > 10) return res.status(400).json({ message: "Max quantity is 10" });
    if (quantity < 1) return res.status(400).json({ message: "Min quantity is 1" });

    try {
        const product = await productModel.findById(productId);
        const variant = product.variants[variantIndex] || { stock: product.stock || 0 };
        
        if (variant.stock < quantity) {
            return res.status(400).json({ 
                message: "Insufficient stock", 
                availableStock: variant.stock 
            });
        }

        const cart = await cartModel.findOne({ user: req.user._id });
        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId && item.variantIndex === variantIndex
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            res.status(200).json({ message: "Quantity updated", cart });
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    const { productId, variantIndex } = req.params;

    try {
        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => 
            !(item.product.toString() === productId && item.variantIndex == variantIndex)
        );

        await cart.save();
        res.status(200).json({ message: "Item removed", cart });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await cartModel.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
