import { useDispatch } from "react-redux"
import { setCart, setLoading, setError } from "../state/cart.slice"
import { addToCart, getCart, updateQuantity, removeFromCart, clearCart } from "../service/cart.api"

export const useCart = () => {
    const dispatch = useDispatch()

    const handleGetCart = async () => {
        dispatch(setLoading(true))
        try {
            const data = await getCart()
            dispatch(setCart(data))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to load cart"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleAddToCart = async (productId, variantIndex, quantity) => {
        try {
            const data = await addToCart(productId, variantIndex, quantity)
            await handleGetCart()
            return data
        } catch (error) {
            throw error.response?.data
        }
    }

    const handleUpdateQuantity = async (productId, variantIndex, quantity) => {
        try {
            const data = await updateQuantity(productId, variantIndex, quantity)
            await handleGetCart()
            return data
        } catch (error) {
            throw error.response?.data
        }
    }

    const handleRemoveFromCart = async (productId, variantIndex) => {
        try {
            const data = await removeFromCart(productId, variantIndex)
            await handleGetCart()
            return data
        } catch (error) {
            throw error.response?.data
        }
    }

    const handleClearCart = async () => {
        try {
            const data = await clearCart()
            await handleGetCart()
            return data
        } catch (error) {
            throw error.response?.data
        }
    }

    return {
        handleGetCart,
        handleAddToCart,
        handleUpdateQuantity,
        handleRemoveFromCart,
        handleClearCart
    }
}
