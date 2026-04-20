import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { addToCart, getCart, updateQuantity, removeFromCart, clearCart } from "../controllers/cart.controller.js";

const router = Router();

// Middleware to ensure user is a buyer
const isBuyer = (req, res, next) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: "Only buyers can access the cart" });
    }
    next();
};

router.use(authenticateUser, isBuyer);

router.post("/add", addToCart);
router.get("/", getCart);
router.patch("/update", updateQuantity);
router.delete("/remove/:productId/:variantIndex", removeFromCart);
router.post("/clear", clearCart);

export default router;
