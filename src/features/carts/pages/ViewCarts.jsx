import { useEffect, useMemo, useState } from "react";
import { useCart } from "../hook/useCart";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    X,
    Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
};

const ViewCarts = () => {
    const {
        handelGetCart,
        handelDeleteProductFromCart,
        handelIncrementQuantity,
        handelDecrementQuantity,
    } = useCart();

    const [cartDetails, setCartDetails] = useState(null);
    const [quantityMap, setQuantityMap] = useState({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCartItemId, setSelectedCartItemId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const carts = await handelGetCart();
            setCartDetails(carts);

            const nextQuantityMap = {};
            (carts?.items || []).forEach((item) => {
                nextQuantityMap[item._id] = item.quantity || 1;
            });
            setQuantityMap(nextQuantityMap);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load cart");
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const cartItems = cartDetails?.items || [];

    const totalAmount = useMemo(() => {
        return cartDetails?.items[0]?.totalCartPrice
    }, [cartDetails]);

    const totalSymbol = cartDetails?.items[0]?.currency || "INR";

    const openDeleteDialog = (itemId) => {
        setSelectedCartItemId(itemId);
        setShowDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedCartItemId(null);
    };

    const handleDecrementQuantity = async (itemId) => {
        const currentQty = quantityMap[itemId] || 1;
        if (currentQty <= 1) return;

        setQuantityMap((prev) => ({
            ...prev,
            [itemId]: currentQty - 1,
        }));

        try {
            await handelDecrementQuantity(itemId);
        } catch (error) {
            setQuantityMap((prev) => ({
                ...prev,
                [itemId]: currentQty,
            }));
            toast.error(error?.response?.data?.message || "Failed to update quantity");
        }
    };

    const handleIncrementQuantity = async (itemId) => {
        const currentQty = quantityMap[itemId] || 1;

        setQuantityMap((prev) => ({
            ...prev,
            [itemId]: currentQty + 1,
        }));

        try {
            await handelIncrementQuantity(itemId);
        } catch (error) {
            setQuantityMap((prev) => ({
                ...prev,
                [itemId]: currentQty,
            }));
            toast.error(error?.response?.data?.message || "Failed to update quantity");
        }
    };

    const confirmDeleteCart = async () => {
        const itemId = selectedCartItemId;
        console.log(itemId)
        if (!itemId) return;

        setDeleting(true);
        try {
            setCartDetails((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: (prev.items || []).filter((item) => item._id !== itemId),
                };
            });

            setQuantityMap((prev) => {
                const next = { ...prev };
                delete next[itemId];
                return next;
            });

            await handelDeleteProductFromCart(itemId);
            closeDeleteDialog();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete cart item");
            fetchCart();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            <header className="border-b border-black/5 bg-[#111111] text-white shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717] shadow-sm">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Stnitch</p>
                            <h1 className="text-lg font-semibold">Your cart</h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Stnitch</p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Your carts</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            Review items before placing your order.
                        </p>
                    </div>

                    <div className="rounded-[1.75rem] border border-black/5 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Total</p>
                        <p className="mt-1 text-2xl font-semibold text-zinc-900">
                            {totalSymbol}{totalAmount}
                        </p>
                    </div>
                </div>

                {!cartItems.length ? (
                    <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900">Your cart is empty</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                            Items you add will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <section className="space-y-4">
                            {cartItems.map((item) => {
                                const itemId = item._id;
                                const image = item?.images?.[0];
                                const title = (item?.title || "Product").trim();
                                const description = item?.description || "No description available.";
                                const amount = item?.price?.amount || 0;
                                const currency = item?.price?.currency || "INR";
                                const symbol = currencySymbols[currency] || currency;
                                const qty = item?.quantity || quantityMap[itemId];
                                const attributes = item?.attributes || {};

                                return (
                                    <article
                                        key={itemId}
                                        className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)]"
                                    >
                                        <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr_auto] sm:items-center">
                                            <div
                                                onClick={() => navigate(`/product/${item.productId}`)}
                                                className="relative cursor-pointer overflow-hidden rounded-2xl bg-[#f4f1eb]"
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={title}
                                                        className="h-40 w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-40 w-full items-center justify-center text-zinc-400">
                                                        <ShoppingBag className="h-10 w-10" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-lg font-semibold tracking-tight text-zinc-900">
                                                            {title}
                                                        </h3>
                                                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600">
                                                            {description}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteDialog(itemId)}
                                                        className="inline-flex cursor-pointer px-2 py-2 items-center justify-center rounded-full border border-black/10 bg-[#fdfbf7] text-zinc-700 transition hover:bg-[#f4f1eb]"
                                                        aria-label="Delete cart item"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                                                    <span className="rounded-full border border-black/5 bg-[#faf8f5] px-3 py-1.5">
                                                        {symbol}{amount}
                                                    </span>

                                                    {Object.keys(attributes).length > 0 && (
                                                        <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-[#faf8f5] px-3 py-1.5">
                                                            <Tag className="h-4 w-4" />
                                                            {Object.entries(attributes)
                                                                .map(([k, v]) => `${k}: ${v}`)
                                                                .join(" • ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                                                <div className="inline-flex items-center rounded-2xl border border-black/5 bg-[#faf8f5]">
                                                    <button
                                                        onClick={() => handleDecrementQuantity(itemId)}
                                                        type="button"
                                                        className="cursor-pointer px-3 py-2 text-zinc-600 transition hover:text-zinc-900"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="min-w-10 px-3 py-2 text-center text-sm font-medium text-zinc-900">
                                                        {qty}
                                                    </span>
                                                    <button
                                                        onClick={() => handleIncrementQuantity(itemId)}
                                                        type="button"
                                                        className="cursor-pointer px-3 py-2 text-zinc-600 transition hover:text-zinc-900"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <p className="text-sm text-zinc-500 sm:mt-2">
                                                    {symbol}{(amount * qty).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <aside className="space-y-4 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Summary</p>
                                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                                    Order overview
                                </h3>
                            </div>

                            <div className="space-y-3 rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-5 text-sm text-zinc-600">
                                <div className="flex items-center justify-between">
                                    <span>Items</span>
                                    <span className="font-medium text-zinc-900">{cartItems.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Total</span>
                                    <span className="font-medium text-zinc-900">
                                        {totalSymbol + " " + totalAmount}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Delivery</span>
                                    <span className="font-medium text-zinc-900">Calculated later</span>
                                </div>
                            </div>


                        </aside>
                    </div>
                )}
            </main>

            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                                    Remove item?
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-zinc-600">
                                    This will remove the cart item from your list.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDeleteDialog}
                                className="cursor-pointer rounded-full border border-black/10 bg-white p-2 text-zinc-600 transition hover:bg-zinc-50"
                                aria-label="Close dialog"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteDialog}
                                className="flex-1 cursor-pointer rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteCart}
                                disabled={deleting}
                                className="flex-1 cursor-pointer rounded-2xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? "Removing..." : "Yes, remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewCarts;