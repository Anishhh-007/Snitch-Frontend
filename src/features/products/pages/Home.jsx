import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useProduct } from "../hook/useProducts";
import {
    ArrowRight,
    ChevronRight,
    Heart,
    Menu,
    Search,
    ShoppingCart,
    Star,
    Sparkles,
    Tag,
    ScrollText,
    LogOut,
    ArrowLeft,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { useAuth } from "../../auth/hook/useAuth";
import { setUser } from "../../auth/state/auth.slice";

const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
};

const categories = ["All", "Tops", "Bottoms", "Shoes", "Accessories"];

const getFirstVariant = (product) => product?.variants?.[0] || null;

const getProductImage = (product) => {
    const firstVariant = getFirstVariant(product);
    const firstImage = firstVariant?.images?.[0];

    if (typeof firstImage === "string") return firstImage;
    if (firstImage?.url) return firstImage.url;

    return null;
};

const getProductPrice = (product) => {
    const firstVariant = getFirstVariant(product);
    return firstVariant?.price || { amount: 0, currency: "USD" };
};

const Home = () => {
    const { handelGetAllproduct } = useProduct();
    const { handelLogout } = useAuth();
    const products = useSelector((state) => state.product.allProducts) || [];
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [state, setState] = useState(false);
    const [Logout, setLogout] = useState(false);
    const [sortOrder, setSortOrder] = useState(null);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [productStatus, setProductStatus] = useState(false);

    const fetchAllProducts = async () => {
        try {
            setProductStatus(true);
            const res = await handelGetAllproduct();
        } catch (error) {
            console.log(error);
        } finally {
            setProductStatus(false);
        }
    };




    useEffect(() => {
        fetchAllProducts();

    }, []);

    const handleLogout = async () => {
        try {
            setState(true);
            const res = await handelLogout();
            dispatch(setUser(null));
        } catch (error) {
            toast.error(error?.response?.data?.message);
        } finally {
            setState(false);
            setLogout(false);
            navigate("/login");
        }
    };

    const cycleSortOrder = () => {
        setSortOrder((prev) => {
            if (prev === null) return "asc";
            if (prev === "asc") return "desc";
            return null;
        });
    };

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = products.filter((product) => {
            const title = (product.title || "").toLowerCase();
            const description = (product.description || "").toLowerCase();
            const type = (product.type || "").toLowerCase();

            const matchesSearch =
                !query || title.includes(query) || description.includes(query);

            if (activeCategory === "All") return matchesSearch;

            return matchesSearch && activeCategory.toLowerCase() === type;
        });

        if (!sortOrder) return filtered;

        return [...filtered].sort((a, b) => {
            const priceA = getProductPrice(a)?.amount ?? 0;
            const priceB = getProductPrice(b)?.amount ?? 0;
            return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
        });
    }, [products, search, activeCategory, sortOrder]);

    const sortLabel =
        sortOrder === "asc"
            ? "Price: Low → High"
            : sortOrder === "desc"
                ? "Price: High → Low"
                : "Sort by Price";

    const SortIcon =
        sortOrder === "asc" ? ArrowUp : sortOrder === "desc" ? ArrowDown : ArrowUpDown;

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            {user && (
                <header className="sticky top-0 z-30 border-b border-black/5 bg-[#111111] text-white shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90 transition hover:bg-white/10 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link to="/" className="flex shrink-0 items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#1b1b1b] shadow-sm">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="leading-tight">
                                <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                                    Stnitch
                                </p>
                                <h1 className="text-lg font-semibold">Store</h1>
                            </div>
                        </Link>

                        <div className="hidden flex-1 items-center gap-3 lg:flex">
                            <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                                <Search className="h-4 w-4 text-white/45" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    type="text"
                                    placeholder="Search products, shirts, jackets, accessories..."
                                    className="ml-3 w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                                />
                            </div>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <Link
                                to="/cart"
                                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/80 transition hover:bg-white/10"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Cart
                            </Link>
                            <button
                                type="button"
                                onClick={() => navigate("/orders")}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                            >
                                <ScrollText className="h-4 w-4" />
                                Orders
                            </button>
                            {user?.role === "seller" && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/dashboard")}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Dashboard
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setLogout(true)}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-white/5 bg-white/5 px-4 py-3 lg:hidden">
                        <div className="mx-auto flex max-w-7xl items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                            <Search className="h-4 w-4 text-white/45" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                type="text"
                                placeholder="Search products..."
                                className="ml-3 w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                            />
                        </div>
                    </div>
                </header>
            )}

            <section className="border-b border-black/5 bg-[#f6f3ee]">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {categories.map((category) => {
                            const active = activeCategory === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`whitespace-nowrap cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition ${active
                                        ? "border-[#171717] bg-[#171717] text-white"
                                        : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                                        }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <main
                id="products"
                className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
            >
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="cursor-pointer text-2xl font-semibold tracking-tight text-zinc-900">
                            Featured products
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            {filteredProducts.length} item
                            {filteredProducts.length !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={cycleSortOrder}
                        className={`hidden cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-sm transition md:inline-flex ${sortOrder
                            ? "border-[#171717] bg-[#171717] text-white hover:bg-black"
                            : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-50"
                            }`}
                    >
                        <SortIcon className="h-4 w-4" />
                        {sortLabel}
                    </button>
                </div>

                {productStatus ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm"
                            >
                                <div className="relative aspect-[4/5] bg-[#f4f1eb] overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="relative h-4 w-3/4 rounded-full bg-zinc-100 overflow-hidden">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite_0.1s] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                                    </div>
                                    <div className="relative h-3 w-full rounded-full bg-zinc-100 overflow-hidden">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite_0.15s] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                                    </div>
                                    <div className="relative h-3 w-2/3 rounded-full bg-zinc-100 overflow-hidden">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite_0.2s] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                                        <div className="relative h-6 w-16 rounded-full bg-zinc-100 overflow-hidden">
                                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite_0.25s] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                                        </div>
                                        <div className="relative h-9 w-20 rounded-2xl bg-zinc-100 overflow-hidden">
                                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite_0.3s] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900">
                            No products found
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                            Try another search term or switch back to All categories.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const title = (product.title || "Untitled product").trim();
                            const description =
                                product.description || "No description available.";

                            const price = getProductPrice(product);
                            const amount = price?.amount ?? 0;
                            const currency = price?.currency || "USD";
                            const symbol = currencySymbols[currency] || currency;

                            const image = getProductImage(product);

                            return (
                                <article
                                    key={product._id}
                                    className="group overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
                                >
                                    <Link to={`/product/${product._id}`} className="block">
                                        <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f1eb]">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={title}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-[#f4f1eb] text-zinc-400">
                                                    <ShoppingCart className="h-10 w-10" />
                                                </div>
                                            )}
                                            <div className="absolute left-3 top-3 rounded-full border border-black/5 bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur">
                                                {currency}
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="p-4">
                                        <div className="mb-2 flex items-start justify-between gap-3">
                                            <h3 className="line-clamp-1 text-base font-semibold text-zinc-900">
                                                {title}
                                            </h3>
                                        </div>

                                        <p className="line-clamp-2 text-sm leading-6 text-zinc-600">
                                            {description}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                                                    Price
                                                </p>
                                                <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
                                                    {symbol}
                                                    {amount}
                                                </p>
                                            </div>

                                            <Link
                                                to={`/product/${product._id}`}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                                            >
                                                View
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

            {/* Logout Confirmation Dialog */}
            {Logout && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                        onClick={() => setLogout(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                            <div className="h-1 w-full bg-red-500" />
                            <div className="px-6 py-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                                        <LogOut className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900">Log out of Stnitch?</p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            You'll be signed out of your account. Any unsaved changes will be lost.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={state}
                                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        {state ? "Logging out…" : "Yes, log out"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogout(false)}
                                        disabled={state}
                                        className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl border border-black/10 bg-[#faf8f5] py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;