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
 * Comprehensive synonym and related products map
 * Groups similar items and variations together
 */
const SYNONYM_MAP = {
    // Bottoms
    "pant": ["pants", "trouser", "trousers", "jeans", "denim", "khaki", "chinos", "leggings", "shorts", "skirt"],
    "pants": ["pant", "trouser", "trousers", "jeans", "denim", "khaki", "chinos", "leggings", "shorts", "skirt"],
    "trouser": ["trousers", "pant", "pants", "jeans", "denim", "khaki", "chinos", "leggings", "shorts"],
    "trousers": ["trouser", "pant", "pants", "jeans", "denim", "khaki", "chinos", "leggings", "shorts"],
    "jean": ["jeans", "denim", "pant", "pants", "trouser", "trousers", "shorts", "khaki"],
    "jeans": ["jean", "denim", "pant", "pants", "trouser", "trousers", "shorts", "khaki"],
    "denim": ["jeans", "jean", "pant", "pants", "trouser", "shorts", "khaki", "chinos"],
    "shorts": ["short", "pant", "pants", "jeans", "khaki", "skirt"],
    "skirt": ["skirts", "dress", "pant", "pants", "shorts", "leggings"],

    // Tops
    "shirt": ["shirts", "tshirt", "t-shirt", "top", "tops", "blouse", "polo", "formal"],
    "tshirt": ["t-shirt", "shirt", "top", "tops", "blouse", "polo"],
    "t-shirt": ["tshirt", "shirt", "top", "tops", "blouse", "polo"],
    "top": ["tops", "shirt", "tshirt", "t-shirt", "blouse", "polo", "crop"],
    "blouse": ["blouses", "shirt", "top", "tshirt", "polo"],
    "polo": ["polos", "shirt", "tshirt", "top", "formal"],

    // Outerwear
    "jacket": ["jackets", "coat", "coats", "blazer", "hoodie", "sweater", "cardigan"],
    "coat": ["coats", "jacket", "jackets", "blazer", "hoodie", "cardigan"],
    "blazer": ["blazers", "jacket", "coat", "formal"],
    "hoodie": ["hoodies", "jacket", "sweater", "cardigan", "sweatshirt"],
    "sweater": ["sweaters", "cardigan", "hoodie", "jacket"],
    "cardigan": ["cardigans", "sweater", "hoodie", "jacket"],

    // Footwear
    "shoe": ["shoes", "sneaker", "sneakers", "boot", "boots", "heel", "heels", "flip-flop", "sandal"],
    "shoes": ["shoe", "sneaker", "sneakers", "boot", "boots", "heel", "heels", "sandal"],
    "sneaker": ["sneakers", "shoe", "shoes", "boot", "boots"],
    "sneakers": ["sneaker", "shoe", "shoes", "boot", "boots"],
    "boot": ["boots", "shoe", "shoes", "sneaker"],
    "boots": ["boot", "shoe", "shoes", "sneaker"],

    // Accessories
    "belt": ["belts", "accessory", "watch", "bag", "scarf"],
    "bag": ["bags", "purse", "backpack", "tote", "accessory"],
    "watch": ["watches", "accessory", "belt", "scarf"],
    "scarf": ["scarves", "accessory", "shawl", "wrap"],
    "accessory": ["accessories", "belt", "bag", "watch", "scarf"]
};

/**
 * Calculate string similarity using Levenshtein distance
 * Returns a value between 0 and 1 (1 = exact match)
 */
function calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    if (Math.abs(s1.length - s2.length) > 3) return 0;

    const len = Math.max(s1.length, s2.length);
    let distance = 0;
    
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
        if (s1[i] !== s2[i]) distance++;
    }
    
    distance += Math.abs(s1.length - s2.length);
    
    return Math.max(0, 1 - (distance / len));
}

/**
 * Get related terms for a search query
 * Returns direct synonyms and fuzzy matches
 */
function getRelatedTerms(query) {
    const lowerQuery = query.toLowerCase().trim();
    const relatedTerms = new Set();
    
    // Direct synonym lookup
    if (SYNONYM_MAP[lowerQuery]) {
        SYNONYM_MAP[lowerQuery].forEach(term => relatedTerms.add(term));
    }
    
    // Fuzzy matching - find terms that are similar but not exact matches
    Object.keys(SYNONYM_MAP).forEach(key => {
        const similarity = calculateSimilarity(lowerQuery, key);
        if (similarity > 0.7 && similarity < 1) { // Similar but not exact
            relatedTerms.add(key);
            // Also add synonyms of the fuzzy match
            SYNONYM_MAP[key].forEach(term => relatedTerms.add(term));
        }
    });
    
    return Array.from(relatedTerms).slice(0, 8); // Return top 8 related terms
}

export async function getSearchSuggestions(req, res) {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.status(200).json({ suggestions: [], related: [] });
    }

    try {
        const query = q.trim();
        const lowerQuery = query.toLowerCase();
        
        // 1. Direct matches on titles/categories (prefix matching)
        const directMatches = await productModel.find({
            $or: [
                { title: { $regex: `^${query}`, $options: "i" } },
                { category: { $regex: `^${query}`, $options: "i" } },
                { tags: { $in: [new RegExp(`^${query}`, "i")] } }
            ]
        }).limit(6).select("title category tags");

        const directSuggestions = [];
        const seen = new Set();
        
        directMatches.forEach(product => {
            if (!seen.has(product.title.toLowerCase())) {
                directSuggestions.push(product.title);
                seen.add(product.title.toLowerCase());
            }
        });

        // 2. Get related/similar terms using synonym map and fuzzy matching
        const relatedTerms = getRelatedTerms(query);
        
        // 3. Find products matching related terms
        let relatedProducts = [];
        if (relatedTerms.length > 0) {
            relatedProducts = await productModel.find({
                $or: [
                    { title: { $in: relatedTerms.map(t => new RegExp(t, "i")) } },
                    { category: { $in: relatedTerms.map(t => new RegExp(t, "i")) } },
                    { tags: { $in: relatedTerms.map(t => new RegExp(t, "i")) } }
                ]
            }).limit(5).select("title category");
        }

        const relatedSuggestions = [];
        const relatedSeen = new Set();
        relatedProducts.forEach(product => {
            if (!relatedSeen.has(product.title.toLowerCase()) && 
                !seen.has(product.title.toLowerCase())) {
                relatedSuggestions.push(product.title);
                relatedSeen.add(product.title.toLowerCase());
            }
        });

        return res.status(200).json({
            success: true,
            suggestions: directSuggestions.slice(0, 6),
            related: relatedSuggestions.slice(0, 6),
            relatedTerms: relatedTerms
        });

    } catch (error) {
        console.error("Search suggestions error:", error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching suggestions", 
            error: error.message 
        });
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