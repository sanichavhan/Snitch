import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";


export async function createProduct(req, res) {
    const { title, description, priceAmount, priceCurrency, category, tags } = req.body;
    const seller = req.user;

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))


    const product = await productModel.create({
        title,
        description,
        category,
        tags: tags ? JSON.parse(tags) : [],
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })


    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user;
    const { q } = req.query;

    let query = { seller: seller._id };

    if (q && q.length >= 3) {
        query.$and = [
            { seller: seller._id },
            {
                $or: [
                    { title: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i" } },
                    { category: { $regex: q, $options: "i" } },
                    { tags: { $in: [ new RegExp(q, "i") ] } }
                ]
            }
        ];
        delete query.seller; // Already handled in $and
    }

    const products = await productModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts(req, res) {
    const { q } = req.query;
    let query = {};

    if (q && q.length >= 3) {
        query = {
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } },
                { tags: { $in: [ new RegExp(q, "i") ] } }
            ]
        };
    }

    const products = await productModel.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

/**
 * Similarity map for related search suggestions
 */
const RELATED_MAP = {
    "shirt": [ "Pants", "Jackets", "Trousers", "Suits" ],
    "pant": [ "Shirts", "Polos", "Belts", "Shoes" ],
    "tshirt": [ "Shorts", "Denims", "Hoodies" ],
    "minimalist": [ "Clean", "Pure", "Essential" ]
};

export async function getSearchSuggestions(req, res) {
    const { q } = req.query;

    if (!q || q.length < 3) {
        return res.status(200).json({ suggestions: [], related: [] });
    }

    try {
        // 1. Direct matches on titles/categories
        const products = await productModel.find({
            $or: [
                { title: { $regex: `^${q}`, $options: "i" } },
                { category: { $regex: `^${q}`, $options: "i" } }
            ]
        }).limit(5).select("title category");

        const directSuggestions = [ ...new Set(products.map(p => p.title)) ];

        // 2. Similarity suggestions (using RELATED_MAP)
        let related = [];
        const lowerQ = q.toLowerCase();
        Object.keys(RELATED_MAP).forEach(key => {
            if (lowerQ.includes(key)) {
                related = [ ...related, ...RELATED_MAP[ key ] ];
            }
        });

        // 3. Category matches as related
        const categoryMatches = await productModel.distinct("category", {
            category: { $regex: q, $options: "i" }
        });

        return res.status(200).json({
            success: true,
            suggestions: directSuggestions,
            related: [ ...new Set([ ...related, ...categoryMatches ]) ].slice(0, 5)
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching suggestions", error: error.message });
    }
}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
}


export async function addProductVariant(req, res) {

    const productId = req.params.productId;

    const product = await productModel.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files;
    const images = [];
    if (files || files.length !== 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")

    console.log(price)

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes
    })

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })

}