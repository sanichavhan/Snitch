import axios from "axios";

const productApiInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/products`,
    withCredentials: true,
})

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData)

    return response.data
}

export async function getSellerProduct(query = {}) {
    const response = await productApiInstance.get("/seller", { params: query })
    return response.data
}

export async function getAllProducts(query = {}) {
    const response = await productApiInstance.get("/", { params: query })
    return response.data
}

export async function getSearchSuggestions(query) {
    const response = await productApiInstance.get("/suggestions", { params: { q: query } })
    return response.data
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export async function addProductVariant(productId, newProductVariant) {

    console.log(newProductVariant)

    const formData = new FormData()

    newProductVariant.images.forEach((image) => {
        formData.append(`images`, image.file)
    })

    formData.append("stock", newProductVariant.stock)
    formData.append("priceAmount", newProductVariant.price)
    formData.append("attributes", JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`, formData)

    return response.data

}