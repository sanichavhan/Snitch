import axios from "axios";

const API_URL = "/api/cart";

export const addToCart = async (productId, variantIndex, quantity) => {
    const response = await axios.post(`${API_URL}/add`, { productId, variantIndex, quantity }, { withCredentials: true });
    return response.data;
};

export const getCart = async () => {
    const response = await axios.get(API_URL, { withCredentials: true });
    return response.data;
};

export const updateQuantity = async (productId, variantIndex, quantity) => {
    const response = await axios.patch(`${API_URL}/update`, { productId, variantIndex, quantity }, { withCredentials: true });
    return response.data;
};

export const removeFromCart = async (productId, variantIndex) => {
    const response = await axios.delete(`${API_URL}/remove/${productId}/${variantIndex}`, { withCredentials: true });
    return response.data;
};

export const clearCart = async () => {
    const response = await axios.post(`${API_URL}/clear`, {}, { withCredentials: true });
    return response.data;
};
