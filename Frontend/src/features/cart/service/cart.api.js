import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/cart`,
    withCredentials: true,
})

// Add interceptor to include token in Authorization header
cartApiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

export const addToCart = async (productId, variantIndex, quantity) => {
    const response = await cartApiInstance.post("/add", { productId, variantIndex, quantity });
    return response.data;
};

export const getCart = async () => {
    const response = await cartApiInstance.get("/");
    return response.data;
};

export const updateQuantity = async (productId, variantIndex, quantity) => {
    const response = await cartApiInstance.patch("/update", { productId, variantIndex, quantity });
    return response.data;
};

export const removeFromCart = async (productId, variantIndex) => {
    const response = await cartApiInstance.delete(`/remove/${productId}/${variantIndex}`);
    return response.data;
};

export const clearCart = async () => {
    const response = await cartApiInstance.post("/clear", {});
    return response.data;
};
