import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProduct } from "../hook/useProducts.js";
import {
    Heart,
    ShoppingBag,
    ShoppingCart,
    ShieldCheck,
    Truck,
    Star,
    ImagePlus,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    X,
    Send,
    Bot,
    User,
    Tag,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import Navbar from "../component/Navbar.jsx";
import { useCart } from "../../carts/hook/useCart.js";
import { useDispatch, useSelector } from "react-redux";
import { setDealDone, setNegotiatedPrice } from "../state/product.slice.js";
import toast from "react-hot-toast";

const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
};

/* ─────────────────────────────────────────────
   Negotiation Dialog
───────────────────────────────────────────── */
const NegotiationDialog = ({
    isOpen,
    onClose,
    product,
    selectedVariant,
    originalPrice,
    symbol,
    currency,
    onDealAccepted,

}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pendingAiPrice, setPendingAiPrice] = useState(null); // AI has proposed this price, waiting for user decision
    // const [dealDone, setDealDone] = useState(false);
    const dealDone = useSelector((state) => state.product.dealDone);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const { handelNegociatePrice } = useProduct()
    const dispatch = useDispatch()

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, pendingAiPrice]);

    // Focus input when dialog opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            if (messages.length === 0) {
                // Greeting from AI on first open
                setMessages([
                    {
                        role: "ai",
                        content:
                            "Hey there 👋 I see you're interested in this product. The listed price is " +
                            symbol +
                            originalPrice +
                            ". Think you can do better? Make your case — I'm all ears, but I don't do charity.",
                    },
                ]);
            }
        }
    }, [isOpen]);

    // Reset everything when dialog closes (except we keep messages so user can reopen mid-session)
    const handleClose = () => {
        if (!dealDone) {
            // Reset negotiation state only if no deal was struck this session
        }
        onClose();
    };

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading || dealDone) return;

        const userMessage = { role: "user", content: trimmed };
        const newMessages = [...messages, userMessage];
        // console.log(newMessages);
        const details = {
            title: product.title,
            price: originalPrice,
            attributes: selectedVariant?.attributes,
        }
        setMessages(newMessages);
        setInput("");
        setLoading(true);
        setPendingAiPrice(null);

        try {
            // ──────────────────────────────────────────────────────────
            // YOUR BACKEND ENDPOINT
            // Expects: { messages, productId, variantId, originalPrice }
            // Returns: { aiPrice: number, aiResponse: string }
            //   • aiPrice > 0  → AI proposes that price
            //   • aiPrice === 0 → AI is just chatting, no price yet
            // ──────────────────────────────────────────────────────────
            const res = await handelNegociatePrice(details, newMessages)
            // console.log(res)
            const { aiPrice, aiResponse } = res.response
            setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);

            if (aiPrice > 0 && aiPrice < originalPrice) {
                setPendingAiPrice(aiPrice);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: "Hmm, something went wrong on my end. Try again in a sec.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const acceptDeal = () => {
        if (!pendingAiPrice) return;
        onDealAccepted(pendingAiPrice);
        dispatch(setNegotiatedPrice(pendingAiPrice))
        dispatch(setDealDone(true));

        setPendingAiPrice(null);
        setMessages((prev) => [
            ...prev,
            {
                role: "ai",
                content: `Deal! 🤝 You got it for ${symbol}${pendingAiPrice}. Hit "Buy now" to lock in this price — it won't survive a page refresh!`,
            },
        ]);
        setTimeout(() => onClose(), 1800);
    };

    const rejectDeal = () => {
        setPendingAiPrice(null);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4">
                <div className="flex w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] rounded-b-none sm:rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
                    style={{ maxHeight: "82vh" }}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-white">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">AI Price Negotiator</p>
                                <p className="text-xs text-zinc-500">Listed: {symbol}{originalPrice}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-[#faf8f5] text-zinc-600 transition hover:bg-zinc-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {messages.map((msg, i) => {
                            const isAi = msg.role === "ai";
                            return (
                                <div
                                    key={i}
                                    className={`flex gap-2.5 ${isAi ? "items-start" : "items-start flex-row-reverse"}`}
                                >
                                    {/* Avatar */}
                                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isAi
                                        ? "bg-[#171717] text-white"
                                        : "bg-[#f2e9dd] text-zinc-700"
                                        }`}>
                                        {isAi ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${isAi
                                            ? "rounded-tl-sm bg-[#faf8f5] text-zinc-800"
                                            : "rounded-tr-sm bg-[#171717] text-white"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>
                                <div className="rounded-2xl rounded-tl-sm bg-[#faf8f5] px-4 py-3">
                                    <div className="flex gap-1 items-center h-4">
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* AI Price Proposal Banner */}
                    {pendingAiPrice && !loading && (
                        <div className="mx-4 mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag className="h-4 w-4 text-emerald-600" />
                                <p className="text-sm font-semibold text-emerald-800">
                                    AI proposed: {symbol}{pendingAiPrice}
                                </p>
                                <span className="ml-auto text-xs text-emerald-600 line-through">
                                    {symbol}{originalPrice}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={acceptDeal}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Accept deal
                                </button>
                                <button
                                    type="button"
                                    onClick={rejectDeal}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Keep negotiating
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    {!dealDone && (
                        <div className="border-t border-black/5 px-4 py-3">
                            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-[#faf8f5] px-4 py-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={loading ? "AI is thinking…" : "Make your offer…"}
                                    disabled={loading || !!pendingAiPrice}
                                    className="flex-1 bg-transparent text-sm text-zinc-800 placeholder-zinc-400 outline-none disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading || !!pendingAiPrice}
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#171717] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {dealDone && (
                        <div className="border-t border-black/5 px-4 py-3 text-center text-sm text-emerald-600 font-medium">
                            🎉 Deal locked!
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

/* ─────────────────────────────────────────────
   Main ProductDetail
───────────────────────────────────────────── */
const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handelGetProductById } = useProduct();
    const { handelAddToCart } = useCart();
    // const role = useSelector((state) => state.auth.user.role);
    const user = useSelector((state) => state.auth.user);
    const [product, setProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [cartState, setCartState] = useState(false);
    const [navStatus, setNavStatus] = useState(false);
    const negotiatedPrice = useSelector((state) => state.product.negotiatedPrice);
    const dealDone = useSelector((state) => state.product.dealDone);

    // ── Negotiation state ──
    const [negotiationOpen, setNegotiationOpen] = useState(false);

    const variants = product?.variants || [];
    const selectedVariant =
        variants.length > 0 ? variants[selectedVariantIndex] || variants[0] : null;

    const getProduct = async () => {
        const res = await handelGetProductById(productId);
        setProduct(res.data.product);
    };

    useEffect(() => {
        getProduct();
    }, [productId, handelGetProductById]);

    // Reset on product change (including negotiation)
    useEffect(() => {
        setCurrentImageIndex(0);
        setSelectedVariantIndex(0);
        setNegotiatedPrice(null);
    }, [productId]);

    // Reset negotiated price when variant changes
    useEffect(() => {
        setNegotiatedPrice(null);
    }, [selectedVariantIndex]);

    useEffect(() => {
        if (variants.length > 0 && selectedVariantIndex >= variants.length) {
            setSelectedVariantIndex(0);
            setCurrentImageIndex(0);
        }
    }, [variants, selectedVariantIndex]);

    const activeImages = useMemo(() => {
        const variantImages = selectedVariant?.images || [];
        return variantImages.map((img) => img?.url).filter(Boolean);
    }, [selectedVariant]);

    const currentImage = useMemo(() => {
        if (!activeImages.length) return null;
        return activeImages[currentImageIndex] || activeImages[0];
    }, [activeImages, currentImageIndex]);

    const title = (product?.title || "Product").trim();
    const description = product?.description || "No description available.";

    const activePrice = selectedVariant?.price || { amount: 0, currency: "INR" };
    const originalAmount = activePrice.amount ?? 0;
    const currency = activePrice.currency || "INR";
    const symbol = currencySymbols[currency] || currency;

    // Use negotiated price for display if deal was made
    const displayAmount = negotiatedPrice !== null ? negotiatedPrice : originalAmount;

    const goPrev = () => {
        if (!activeImages.length) return;
        setCurrentImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
    };

    const goNext = () => {
        if (!activeImages.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % activeImages.length);
    };

    const handleThumbnailClick = (index) => setCurrentImageIndex(index);

    const handleVariantSelect = (index) => {
        setSelectedVariantIndex(index);
        setCurrentImageIndex(0);
    };

    const getAttributesArray = (variant) => {
        if (!variant?.attributes) return [];
        if (variant.attributes instanceof Map) return Array.from(variant.attributes.entries());
        return Object.entries(variant.attributes);
    };

    const handleAddToCart = async (productId, variantId) => {
        try {
            if (!variantId) return;
            setCartState(true);
            await handelAddToCart(productId, variantId);
            // Cart uses original price — reset negotiated price to remind the user
            setNegotiatedPrice(null);
        } catch (error) {
            console.log(error);
        } finally {
            setCartState(false);
            setNavStatus((prev) => !prev);
        }
    };

    const handleDealAccepted = (price) => {
        setNegotiatedPrice(price);
        setNegotiationOpen(false);
    };

    const selectedVariantAttributes = getAttributesArray(selectedVariant);

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                {!product ? (
                    <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900">No product selected</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                            Open a product from the home page or inventory to view its details here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        {/* LEFT SIDE */}
                        <section className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-[92px_1fr]">
                                <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible md:pt-1">
                                    {activeImages.map((image, index) => {
                                        const active = index === currentImageIndex;
                                        return (
                                            <button
                                                key={`${image}-${index}`}
                                                type="button"
                                                onClick={() => handleThumbnailClick(index)}
                                                className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border transition cursor-pointer ${active
                                                    ? "border-[#171717] ring-2 ring-[#171717]/10"
                                                    : "border-black/10 bg-white opacity-75 hover:opacity-100"
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${title} ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>

                                <div
                                    className="order-1 overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.08)] md:order-2"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <div className="relative aspect-[4/5] w-full bg-[#f4f1eb]">
                                        {currentImage ? (
                                            <img
                                                src={currentImage}
                                                alt={title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-[#f4f1eb] text-zinc-400">
                                                <ShoppingBag className="h-12 w-12" />
                                            </div>
                                        )}

                                        {activeImages.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={goPrev}
                                                    className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/90 p-3 text-zinc-700 shadow-sm transition duration-200 hover:bg-white ${isHovered ? "opacity-100" : "opacity-0"
                                                        } cursor-pointer`}
                                                    aria-label="Previous image"
                                                >
                                                    <ArrowLeft className="h-5 w-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={goNext}
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/90 p-3 text-zinc-700 shadow-sm transition duration-200 hover:bg-white ${isHovered ? "opacity-100" : "opacity-0"
                                                        } cursor-pointer`}
                                                    aria-label="Next image"
                                                >
                                                    <ArrowRight className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}

                                        <div className="absolute left-4 top-4 rounded-full border border-black/5 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur">
                                            {currency}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variant details below image */}
                            {selectedVariant && (
                                <div className="rounded-[1.75rem] ml-26 border border-black/5 bg-white p-5 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                                            Variant details
                                        </p>
                                        <span className="text-xs font-medium text-zinc-500">
                                            Stock: {selectedVariant.stock}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {selectedVariantAttributes.map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-[#faf8f5] px-4 py-3 text-sm"
                                            >
                                                <span className="font-medium text-zinc-900">{key}</span>
                                                <span className="text-zinc-600">{value}</span>
                                            </div>
                                        ))}

                                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-[#faf8f5] px-4 py-3 text-sm">
                                            <span className="font-medium text-zinc-900">Price</span>
                                            <span className="text-zinc-600">
                                                {selectedVariant?.price?.currency || currency}{" "}
                                                {selectedVariant?.price?.amount ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* RIGHT SIDE */}
                        <aside className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Stnitch</p>
                                        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                                            {title}
                                        </h2>
                                    </div>

                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fdfbf7] px-3 py-1.5">
                                        <Star className="h-4 w-4 fill-current text-amber-500" />
                                        Featured
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fdfbf7] px-3 py-1.5">
                                        <ShieldCheck className="h-4 w-4" />
                                        Secure checkout
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fdfbf7] px-3 py-1.5">
                                        <Truck className="h-4 w-4" />
                                        Fast delivery
                                    </span>
                                </div>
                            </div>

                            {/* ── PRICE SECTION ── */}
                            <div className="rounded-[1.75rem] border border-black/5 bg-[#faf8f5] px-5 py-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Price</p>
                                        <div className="mt-1 flex items-end gap-2">
                                            <span className="text-4xl font-semibold tracking-tight text-zinc-900">
                                                {symbol}{displayAmount}
                                            </span>
                                            {/* Show original price struck through when negotiated */}
                                            {negotiatedPrice !== null && (
                                                <span className="mb-1 text-lg text-zinc-400 line-through">
                                                    {symbol}{originalAmount}
                                                </span>
                                            )}
                                        </div>
                                        {/* Deal notice */}
                                        {negotiatedPrice !== null && (
                                            <p className="mt-1 text-xs font-medium text-emerald-600">
                                                🎉 Negotiated price — valid for Buy now only
                                            </p>
                                        )}
                                    </div>

                                    {/* Negotiate button */}
                                    {negotiatedPrice === null && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!user) {
                                                    navigate('/login')
                                                    return toast.error("You need to login first")
                                                }
                                                setNegotiationOpen(true)
                                            }}
                                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-2xl border border-[#171717]/20 bg-[#171717] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Negotiate
                                        </button>
                                    )}

                                    {/* Re-negotiate button if deal exists */}
                                    {negotiatedPrice !== null && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNegotiatedPrice(null);
                                                setNegotiationOpen(true);
                                            }}
                                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-2xl border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Re-negotiate
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Description</p>
                                <p className="text-sm leading-7 text-zinc-600">{description}</p>
                            </div>

                            {variants.length > 0 && (
                                <div className="rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-5">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Variants</p>
                                            <h4 className="mt-1 text-sm font-semibold text-zinc-900">Select one variant</h4>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 overflow-x-auto pb-1">
                                        {variants.map((variant, index) => {
                                            const firstImage = variant?.images?.[0]?.url;
                                            const isActive = selectedVariantIndex === index;
                                            const attrs = getAttributesArray(variant);
                                            const variantColor = attrs.find(([key]) => key.toLowerCase() === "color")?.[1];
                                            const variantSize = attrs.find(([key]) => key.toLowerCase() === "size")?.[1];
                                            const variantPrice = variant?.price || {};
                                            const variantCurrency = variantPrice.currency || currency;
                                            const variantSymbol = currencySymbols[variantCurrency] || variantCurrency;

                                            return (
                                                <button
                                                    key={variant._id || index}
                                                    disabled={dealDone && variant._id !== selectedVariant._id}
                                                    type="button"
                                                    onClick={() => handleVariantSelect(index)}
                                                    className={`min-w-[170px] rounded-[1.5rem] border p-3 text-left transition cursor-pointer ${isActive
                                                        ? "border-[#171717] bg-[#fdfbf7]"
                                                        : "border-black/5 bg-white hover:bg-[#fdfbf7]"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-14 w-12 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-[#f4f1eb]">
                                                            {firstImage ? (
                                                                <img
                                                                    src={firstImage}
                                                                    alt={`variant-${index}`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                                    <ImagePlus className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-zinc-900">Variant {index + 1}</p>
                                                            <p className="mt-1 text-xs text-zinc-500">{variant.stock} in stock</p>
                                                            <p className="mt-2 text-sm font-semibold text-zinc-900">
                                                                {variantSymbol}{variantPrice.amount ?? 0}
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {variantColor && (
                                                                    <span className="rounded-full border border-black/5 bg-[#faf8f5] px-2.5 py-1 text-xs text-zinc-600">
                                                                        {variantColor}
                                                                    </span>
                                                                )}
                                                                {variantSize && (
                                                                    <span className="rounded-full border border-black/5 bg-[#faf8f5] px-2.5 py-1 text-xs text-zinc-600">
                                                                        {variantSize}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row">
                                {/* Add to Cart — always uses original price */}
                                <button
                                    type="button"
                                    disabled={cartState || !selectedVariant}
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login')
                                            return toast.error("You need to login first")
                                        }
                                        handleAddToCart(product._id, selectedVariant?._id)
                                    }}
                                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#171717] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    {cartState ? "Adding..." : "Add to cart"}
                                </button>

                                {/* Buy Now — uses negotiated price if deal was made */}
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login')
                                            return toast.error("You need to login first")
                                        }
                                        navigate(
                                            `/pay/${selectedVariant?._id}/${product._id}`,
                                            {
                                                state: {
                                                    price: negotiatedPrice !== null
                                                        ? { ...selectedVariant?.price, amount: negotiatedPrice }
                                                        : selectedVariant?.price,
                                                    access: 'denied'
                                                },
                                            }
                                        )
                                    }
                                    }
                                    type="button"
                                    disabled={!selectedVariant}
                                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {negotiatedPrice !== null
                                        ? `Buy now · ${symbol}${negotiatedPrice}`
                                        : "Buy now"}
                                </button>
                            </div>

                            {/* Negotiation disclaimer when deal is active */}
                            {negotiatedPrice !== null && (
                                <p className="text-center text-xs text-zinc-400">
                                    ⚠️ Negotiated price applies to Buy now only. Add to cart uses the original price.
                                    Refreshing the page will reset your negotiation.
                                </p>
                            )}
                        </aside>
                    </div>
                )}
            </main>

            {/* Negotiation Dialog */}
            <NegotiationDialog
                isOpen={negotiationOpen}
                onClose={() => setNegotiationOpen(false)}
                product={product}
                selectedVariant={selectedVariant}
                originalPrice={originalAmount}
                symbol={symbol}
                currency={currency}
                onDealAccepted={handleDealAccepted}
            />
        </div>
    );
};

export default ProductDetail;