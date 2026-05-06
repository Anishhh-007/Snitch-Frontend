import { useEffect, useMemo, useState } from "react";
import useOrder from "../hook/useOrder";
import Navbar from "../../products/component/Navbar";
import {
    BadgeCheck,
    CircleDollarSign,
    Filter,
    Package,
    ShoppingBag,
    Sparkles,
    Truck,
} from "lucide-react";
import { useNavigate } from "react-router";

const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
};

const Orders = () => {
    const { handelGetOrder } = useOrder();
    const [order, setOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const res = await handelGetOrder();
            setOrder(res?.data?.orders);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        if (activeFilter === "all") return order;
        return order.filter((item) => item?.paymentStatus === activeFilter);
    }, [order, activeFilter]);

    const getSelectedVariant = (item) => {
        const variants = item?.productId?.variants || [];
        return variants.find((variant) => variant?._id?.toString() === item?.variantId?.toString()) || null;
    };

    const getAttributesArray = (variant) => {
        const attrs = variant?.attributes;
        if (!attrs) return [];
        if (attrs instanceof Map) return Array.from(attrs.entries());
        return Object.entries(attrs);
    };

    const getVariantImage = (variant) => {
        const firstImage = variant?.images?.[0];
        if (typeof firstImage === "string") return firstImage;
        if (firstImage?.url) return firstImage.url;
        return null;
    };

    const filters = [
        { key: "all", label: "All" },
        { key: "pending", label: "Pending" },
        { key: "paid", label: "Paid" },
    ];

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <section className="mb-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fdfbf7] px-4 py-2 text-sm text-zinc-700">
                                <Sparkles className="h-4 w-4" />
                                Your orders
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                                    Order history
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                                    Track products you bought, see payment status, and continue checkout for pending orders.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => {
                                const active = activeFilter === filter.key;
                                return (
                                    <button
                                        key={filter.key}
                                        type="button"
                                        onClick={() => setActiveFilter(filter.key)}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition cursor-pointer ${active
                                            ? "border-[#171717] bg-[#171717] text-white"
                                            : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                                            }`}
                                    >
                                        <Filter className="h-4 w-4" />
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-5">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                <Package className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-zinc-500">Total orders</p>
                            <p className="mt-1 text-3xl font-semibold text-zinc-900">{order.length}</p>
                        </div>

                        <div className="rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-5">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                <CircleDollarSign className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-zinc-500">Pending</p>
                            <p className="mt-1 text-3xl font-semibold text-zinc-900">
                                {order.filter((item) => item.paymentStatus === "pending").length}
                            </p>
                        </div>

                        <div className="rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-5">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                <BadgeCheck className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-zinc-500">Paid</p>
                            <p className="mt-1 text-3xl font-semibold text-zinc-900">
                                {order.filter((item) => item.paymentStatus === "paid").length}
                            </p>
                        </div>
                    </div>
                </section>

                {isLoading ? (
                    <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900">Loading orders</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                            Please wait
                        </p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900">No orders found</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                            Try switching the filter or place a new order.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredOrders.map((item) => {
                            const product = item?.productId || {};
                            const variant = getSelectedVariant(item);
                            const attributes = getAttributesArray(variant);
                            const image = getVariantImage(variant);

                            const price = variant?.price || {};
                            const symbol = currencySymbols[price.currency] || price.currency || "₹";
                            const amount = item?.totalAmount;

                            const isPending = item?.paymentStatus === "pending";
                            const statusStyles = isPending
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700";

                            return (
                                <article
                                    key={item._id}
                                    className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
                                >
                                    <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
                                        <div className="relative aspect-[4/4] bg-[#f4f1eb] lg:aspect-auto">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={product.title || "Order item"}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                    <ShoppingBag className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 sm:p-6">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles}`}>
                                                            {item.paymentStatus}
                                                        </span>
                                                        <span className="inline-flex items-center rounded-full border border-black/10 bg-[#fdfbf7] px-3 py-1 text-xs font-medium text-zinc-600">
                                                            Qty: {item.quantity}
                                                        </span>
                                                        <span className="inline-flex items-center rounded-full border border-black/10 bg-[#fdfbf7] px-3 py-1 text-xs font-medium text-zinc-600">
                                                            Order #{item._id.slice(-6)}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                                                            {product.title || "Untitled product"}
                                                        </h2>
                                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">
                                                            {product.description || "No description available."}
                                                        </p>
                                                    </div>

                                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                        <div className="rounded-2xl border border-black/5 bg-[#faf8f5] p-4 text-sm">
                                                            <p className="text-zinc-500">Type</p>
                                                            <p className="mt-1 font-medium text-zinc-900">
                                                                {product.type || "-"}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-2xl border border-black/5 bg-[#faf8f5] p-4 text-sm">
                                                            <p className="text-zinc-500">Price</p>
                                                            <p className="mt-1 font-medium text-zinc-900">
                                                                {symbol} {amount}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-2xl border border-black/5 bg-[#faf8f5] p-4 text-sm">
                                                            <p className="text-zinc-500">Total amount</p>
                                                            <p className="mt-1 font-medium text-zinc-900">
                                                                ₹ {item.totalAmount ?? amount}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-black/5 bg-[#faf8f5] p-4">
                                                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                                                            Variant details
                                                        </p>
                                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                            {attributes.length > 0 ? (
                                                                attributes.map(([key, value]) => (
                                                                    <div
                                                                        key={key}
                                                                        className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
                                                                    >
                                                                        <span className="font-medium text-zinc-900">
                                                                            {key}
                                                                        </span>
                                                                        <span className="text-zinc-600">
                                                                            {value}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="rounded-xl border border-black/5 bg-white px-3 py-2 text-sm text-zinc-500 sm:col-span-2">
                                                                    No variant attributes found.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                                                    {isPending ? (
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/pay/${item.variantId}/${item.productId._id}`,
                                                                    {
                                                                        state: {
                                                                            price: {
                                                                                amount: amount,
                                                                                currency: price.currency
                                                                            },
                                                                            access: 'granted'
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                            type="button"
                                                            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                                                        >
                                                            Checkout
                                                        </button>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                            <Truck className="h-4 w-4" />
                                                            Paid and ready
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Orders;