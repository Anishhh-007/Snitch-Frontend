import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProduct } from "../hook/useProducts";
import {
    ArrowRight,
    CalendarDays,
    ChevronRight,
    Eye,
    Package,
    Plus,
    Search,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Trash2,
    Layers3,
} from "lucide-react";

const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
};

const getFirstVariant = (product) => product?.variants?.[0] || null;

const getVariantImage = (product) => {
    const firstVariant = getFirstVariant(product);
    const firstImage = firstVariant?.images?.[0];

    if (typeof firstImage === "string") return firstImage;
    if (firstImage?.url) return firstImage.url;

    return null;
};

const getVariantPrice = (product) => {
    const firstVariant = getFirstVariant(product);
    return firstVariant?.price || { amount: 0, currency: "INR" };
};

const SellerDashboard = () => {
    const { handelGetProduct } = useProduct();
    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const getSeller = async () => {
        try {
            const products = await handelGetProduct();
            setInventory(Array.isArray(products) ? products : []);
        } catch (error) {
            console.log(error);
            setInventory([]);
        }
    };

    useEffect(() => {
        getSeller();
    }, []);

    const filteredInventory = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return inventory;

        return inventory.filter((product) => {
            const title = (product.title || "").toLowerCase();
            const description = (product.description || "").toLowerCase();
            const type = (product.type || "").toLowerCase();
            return title.includes(q) || description.includes(q) || type.includes(q);
        });
    }, [inventory, search]);

    const stats = useMemo(() => {
        const total = inventory.length;
        const totalVariants = inventory.reduce(
            (sum, product) => sum + (product?.variants?.length || 0),
            0
        );
        const avgVariants = total ? (totalVariants / total).toFixed(1) : "0.0";

        return { total, totalVariants, avgVariants };
    }, [inventory]);

    const handleDelete = (id) => {
        setInventory((prev) => prev.filter((product) => product._id !== id));
    };

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            <header className="border-b border-black/5 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fdfbf7] px-4 py-2 text-sm text-zinc-700">
                                <Sparkles className="h-4 w-4" />
                                Seller dashboard
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                                    Your inventory
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                                    Manage the products you have created, review details, and keep your store updated.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/create"
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                            >
                                <Plus className="h-4 w-4" />
                                Create product
                            </Link>
                            <button
                                onClick={() => navigate('/')}
                                type="button"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                                View store
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                <Package className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-zinc-500">Total products</p>
                            <p className="mt-1 text-3xl font-semibold text-zinc-900">{stats.total}</p>
                        </div>

                        <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                <Layers3 className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-zinc-500">Total variants</p>
                            <p className="mt-1 text-3xl font-semibold text-zinc-900">{stats.totalVariants}</p>
                        </div>

                        <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-zinc-500">Avg. variants/product</p>
                            <p className="mt-1 text-3xl font-semibold text-zinc-900">{stats.avgVariants}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                            Manage products
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            Delete or review any item from your store inventory.
                        </p>
                    </div>

                    <div className="w-full md:max-w-md">
                        <div className="flex items-center rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                            <Search className="h-4 w-4 text-zinc-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                type="text"
                                placeholder="Search products by title, type, or description"
                                className="ml-3 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {filteredInventory.length === 0 ? (
                    <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900">No products found</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                            Create a product to start filling your inventory.
                        </p>
                        <Link
                            to="/create"
                            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                        >
                            <Plus className="h-4 w-4" />
                            Create product
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredInventory.map((product) => {
                            const title = (product.title || "Untitled product").trim();
                            const description = product.description || "No description available.";
                            const type = product.type || "Uncategorised";

                            const firstVariant = getFirstVariant(product);
                            const price = getVariantPrice(product);
                            const amount = price?.amount ?? 0;
                            const currency = price?.currency || "INR";
                            const symbol = currencySymbols[currency] || currency;
                            const image = getVariantImage(product);

                            return (
                                <article
                                    key={product._id}
                                    className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
                                >
                                    <div
                                        onClick={() => navigate(`/edit/${product._id}`)}
                                        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#f4f1eb]"
                                    >
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={title}
                                                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-[#f4f1eb]">
                                                <ShoppingBag className="h-10 w-10 text-zinc-300" />
                                            </div>
                                        )}

                                        <div className="absolute left-4 top-4 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur">
                                            {currency}
                                        </div>


                                    </div>

                                    <div
                                        className="space-y-4 cursor-pointer p-5"
                                        onClick={() => navigate(`/edit/${product._id}`)}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-zinc-900">
                                                        {title}
                                                    </h3>
                                                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-500">
                                                        {type}
                                                    </p>
                                                </div>
                                                <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#fdfbf7] px-2.5 py-1 text-xs text-zinc-600">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Live
                                                </div>
                                            </div>

                                            <p className="line-clamp-3 text-sm leading-6 text-zinc-600">
                                                {description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-black/5 bg-[#faf8f5] p-4 text-sm">
                                            <div>
                                                <p className="text-zinc-500">Price</p>
                                                <p className="mt-1 text-lg font-semibold text-zinc-900">
                                                    {symbol}
                                                    {amount}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500">Variants</p>
                                                <p className="mt-1 text-lg font-semibold text-zinc-900">
                                                    {product?.variants?.length || 0}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex items-center justify-between border-t border-black/5 pt-4">
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <CalendarDays className="h-4 w-4" />
                                                Inventory item
                                            </div>

                                            <Link
                                                to={`/product/${product._id}`}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                                            >
                                                Details
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
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

export default SellerDashboard;