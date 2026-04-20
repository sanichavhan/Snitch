import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useCart } from '../hooks/useCart';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, loading } = useSelector((state) => state.cart);
    const { handleGetCart, handleUpdateQuantity, handleRemoveFromCart, handleClearCart } = useCart();

    useEffect(() => {
        handleGetCart();
    }, []);

    const subtotal = cart?.items?.reduce((acc, item) => {
        const price = item.product?.variants?.[item.variantIndex]?.price?.amount || item.product?.price?.amount || 0;
        return acc + price * item.quantity;
    }, 0) || 0;

    const shipping = subtotal > 15000 ? 0 : 500;
    const total = subtotal + shipping;

    if (loading && !cart) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf9f6' }}>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium animate-pulse" style={{ color: '#7A6E63' }}>
                    Accessing Archive...
                </p>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#fbf9f6' }}>
                <ShoppingBag className="w-12 h-12 mb-6 opacity-20" style={{ color: '#1b1c1a' }} />
                <h1 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                    Archive is empty
                </h1>
                <p className="text-sm mb-8 text-center max-w-xs" style={{ color: '#7A6E63' }}>
                    Your collection is waiting for its first piece. Explore our latest arrivals.
                </p>
                <Link
                    to="/"
                    className="px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300"
                    style={{ backgroundColor: '#1b1c1a', color: '#fbf9f6' }}
                >
                    Begin Exploration
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>
            <nav className="px-8 lg:px-16 xl:px-24 pt-10 pb-6 flex items-center justify-between border-b" style={{ borderColor: '#e4e2df' }}>
                <Link to="/" className="text-sm font-medium tracking-[0.35em] uppercase hover:opacity-80 transition-opacity" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}>
                    Snitch.
                </Link>
                <div className="flex items-center gap-8">
                    <button
                        onClick={handleClearCart}
                        className="text-[10px] uppercase tracking-[0.2em] font-medium hover:text-red-800 transition-colors"
                        style={{ color: '#7A6E63' }}
                    >
                        Empty Bag
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[10px] uppercase tracking-[0.2em] font-medium hover:text-[#C9A96E] transition-colors"
                        style={{ color: '#7A6E63' }}
                    >
                        Return
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pt-12 lg:pt-20">
                <h1 className="text-4xl md:text-5xl font-light mb-12 lg:mb-20" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                    Your Archive
                </h1>

                <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
                    {/* Item List */}
                    <div className="flex-grow space-y-12">
                        {cart.items.map((item, idx) => {
                            const variant = item.product?.variants?.[item.variantIndex];
                            const stock = variant?.stock || 0;
                            const isStockLow = item.quantity > stock;

                            return (
                                <div key={`${item.product._id}-${item.variantIndex}`} className="flex gap-6 md:gap-10 items-start pb-12 border-b" style={{ borderColor: '#e4e2df' }}>
                                    <div className="w-24 md:w-32 xl:w-40 aspect-[4/5] bg-neutral-100 overflow-hidden flex-shrink-0">
                                        <img
                                            src={variant?.images?.[0]?.url || item.product?.images?.[0]?.url || '/snitch_editorial_warm.png'}
                                            alt={item.product?.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-grow flex flex-col min-h-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-sm md:text-base font-medium tracking-tight" style={{ color: '#1b1c1a' }}>
                                                {item.product?.title}
                                            </h3>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.product._id, item.variantIndex)}
                                                className="p-1 hover:text-red-800 transition-colors opacity-40 hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: '#7A6E63' }}>
                                            {Object.entries(variant?.attributes || {}).map(([key, val]) => `${key}: ${val}`).join(' / ')}
                                        </p>

                                        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                                            <div className="flex items-center border" style={{ borderColor: '#e4e2df' }}>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.variantIndex, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="p-2 disabled:opacity-20 hover:bg-neutral-50 transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 text-center text-[11px] font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.variantIndex, item.quantity + 1)}
                                                    disabled={item.quantity >= 10}
                                                    className="p-2 disabled:opacity-20 hover:bg-neutral-50 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-medium" style={{ color: '#1b1c1a' }}>
                                                    INR {(variant?.price?.amount || item.product?.price?.amount || 0).toLocaleString()}
                                                </p>
                                                {isStockLow && (
                                                    <p className="text-[10px] font-medium mt-1 uppercase tracking-wider" style={{ color: '#7f1d1d' }}>
                                                        Stock Limited: Only {stock} pieces remaining
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                        <div className="p-8 lg:sticky lg:top-24" style={{ backgroundColor: '#f5f3f0' }}>
                            <h2 className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-8" style={{ color: '#C9A96E' }}>
                                Order Summary
                            </h2>

                            <div className="space-y-6 mb-10 text-sm">
                                <div className="flex justify-between" style={{ color: '#7A6E63' }}>
                                    <span>Subtotal</span>
                                    <span>INR {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between" style={{ color: '#7A6E63' }}>
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Complimentary' : `INR ${shipping.toLocaleString()}`}</span>
                                </div>
                                <div className="h-px w-full my-6" style={{ backgroundColor: '#e4e2df' }} />
                                <div className="flex justify-between font-medium text-base" style={{ color: '#1b1c1a' }}>
                                    <span>Total</span>
                                    <span>INR {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                className="w-full py-5 text-[11px] uppercase tracking-[0.3em] font-semibold transition-all duration-300"
                                style={{ backgroundColor: '#1b1c1a', color: '#fbf9f6' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C9A96E'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1b1c1a'}
                            >
                                Proceed to Checkout
                            </button>

                            <p className="mt-8 text-[10px] uppercase tracking-widest text-center leading-relaxed" style={{ color: '#B5ADA3' }}>
                                Complimentary shipping on orders over INR 15,000.
                                All pieces are verified authentic.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
