import { createProduct, getSellerProduct, getAllProducts, getProductById, addProductVariant, getSearchSuggestions } from "../service/product.api"
import { useDispatch } from "react-redux"
import { setSellerProducts, setProducts, setSearchSuggestions, setError } from "../state/product.slice"



export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        try {
            const data = await createProduct(formData)
            return data.product
        } catch (error) {
            console.error("Error creating product:", error);
            dispatch(setError(error.message || "Failed to create product"));
            throw error
        }
    }

    async function handleGetSellerProduct(query = {}) {
        try {
            const data = await getSellerProduct(query)
            if (data.success) {
                dispatch(setSellerProducts(data.products || []))
            }
            return data.products || []
        } catch (error) {
            console.error("Error fetching seller products:", error);
            dispatch(setError(error.message || "Failed to fetch seller products"));
            return []
        }
    }

    async function handleGetAllProducts(query = {}) {
        try {
            const data = await getAllProducts(query)
            if (data.success) {
                dispatch(setProducts({
                    products: data.products || [],
                    showingRelated: data.showingRelated || false,
                    relatedTerms: data.relatedTerms || []
                }));
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            dispatch(setError(error.message || "Failed to fetch products"));
        }
    }

    async function handleGetSuggestions(query) {
        try {
            // Minimum 2 characters for suggestions
            if (!query || query.trim().length < 2) {
                dispatch(setSearchSuggestions({ suggestions: [], related: [] }));
                return;
            }

            const data = await getSearchSuggestions(query.trim());
            
            if (data.success) {
                dispatch(setSearchSuggestions({
                    suggestions: data.suggestions || [],
                    related: data.related || []
                }));
            } else {
                dispatch(setSearchSuggestions({ suggestions: [], related: [] }));
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            dispatch(setSearchSuggestions({ suggestions: [], related: [] }));
        }
    }

    async function handleGetProductById(productId) {
        try {
            const data = await getProductById(productId)
            return data.product
        } catch (error) {
            console.error("Error fetching product:", error);
            dispatch(setError(error.message || "Failed to fetch product"));
            return null
        }
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        try {
            const data = await addProductVariant(productId, newProductVariant)
            return data
        } catch (error) {
            console.error("Error adding product variant:", error);
            dispatch(setError(error.message || "Failed to add product variant"));
            throw error
        }
    }

    return { handleCreateProduct, handleGetSellerProduct, handleGetAllProducts, handleGetProductById, handleAddProductVariant, handleGetSuggestions }

}