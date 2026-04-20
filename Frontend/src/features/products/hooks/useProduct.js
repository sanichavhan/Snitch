import { createProduct, getSellerProduct, getAllProducts, getProductById, addProductVariant, getSearchSuggestions } from "../service/product.api"
import { useDispatch } from "react-redux"
import { setSellerProducts, setProducts, setSearchSuggestions } from "../state/product.slice"



export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct(query = {}) {
        const data = await getSellerProduct(query)
        dispatch(setSellerProducts(data.products))
        return data.products
    }

    async function handleGetAllProducts(query = {}) {
        const data = await getAllProducts(query)
        dispatch(setProducts(data.products))
    }

    async function handleGetSuggestions(query) {
        if (!query || query.length < 3) {
            dispatch(setSearchSuggestions({ suggestions: [], related: [] }));
            return;
        }
        const data = await getSearchSuggestions(query)
        dispatch(setSearchSuggestions(data))
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant)

        return data
    }

    return { handleCreateProduct, handleGetSellerProduct, handleGetAllProducts, handleGetProductById, handleAddProductVariant, handleGetSuggestions }

}