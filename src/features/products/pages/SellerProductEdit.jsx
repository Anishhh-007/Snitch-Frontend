import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CopyPlus,
    DollarSign,
    Edit3,
    Euro,
    Eye,
    ImagePlus,
    IndianRupee,
    JapaneseYen,
    LifeBuoy,
    Minus,
    Plus,
    PoundSterling,
    Save,
    Sparkles,
    Trash2,
    Type,
    X,
} from "lucide-react";
import { useProduct } from "../hook/useProducts";
import toast from "react-hot-toast";

const currencyIcons = {
    USD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling,
    JPY: JapaneseYen,
    INR: IndianRupee,
};

const currencyOptions = ["USD", "EUR", "GBP", "JPY", "INR"];

const makeFilePreview = (file) => ({
    id: crypto.randomUUID(),
    file,
    preview: URL.createObjectURL(file),
});

const emptyVariantDraft = {
    newImageFiles: [],
    stock: "",
    attributes: [{ key: "", value: "" }],
    price: {
        amount: "",
        currency: "INR",
    },
};

const SellerProductEdit = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const { handelEditProduct, handelGetProductById, handelDeleteProduct } = useProduct();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [savingProduct, setSavingProduct] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [mainForm, setMainForm] = useState({
        title: "",
        description: "",
        type: "",
    });

    const [variants, setVariants] = useState([]);
    const [variantDraft, setVariantDraft] = useState(emptyVariantDraft);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const fetchedProduct = await handelGetProductById(productId);
                setProduct(fetchedProduct.data.product);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    useEffect(() => {
        if (!product) return;

        setMainForm({
            title: product.title || "",
            description: product.description || "",
            type: product.type || "tops",
        });

        setVariants(Array.isArray(product.variants) ? product.variants : []);
    }, [product]);

    useEffect(() => {
        return () => {
            variantDraft.newImageFiles.forEach((item) => {
                if (item?.preview) URL.revokeObjectURL(item.preview);
            });
        };
    }, [variantDraft.newImageFiles]);

    const CurrentCurrencyIcon = currencyIcons[variantDraft.price.currency] || DollarSign;

    const stats = useMemo(() => {
        const totalVariants = variants.length;
        const totalImages = variants.reduce(
            (sum, variant) => sum + (variant?.images?.length || 0),
            0
        );

        return {
            totalVariants,
            totalImages,
        };
    }, [variants]);

    const normalizeAttributes = (attributes) => {
        if (!attributes) return [];
        if (attributes instanceof Map) return Array.from(attributes.entries());
        return Object.entries(attributes);
    };

    const handleVariantDraftImagesUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setVariantDraft((prev) => ({
            ...prev,
            newImageFiles: [...prev.newImageFiles, ...files.map(makeFilePreview)],
        }));

        e.target.value = "";
    };

    const handleVariantDraftImageRemove = (index) => {
        setVariantDraft((prev) => {
            const next = [...prev.newImageFiles];
            const removed = next[index];
            if (removed?.preview) URL.revokeObjectURL(removed.preview);
            next.splice(index, 1);
            return { ...prev, newImageFiles: next };
        });
    };

    const updateVariantAttribute = (index, field, value) => {
        setVariantDraft((prev) => {
            const next = [...prev.attributes];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, attributes: next };
        });
    };

    const addVariantAttribute = () => {
        setVariantDraft((prev) => ({
            ...prev,
            attributes: [...prev.attributes, { key: "", value: "" }],
        }));
    };

    const removeVariantAttribute = (index) => {
        setVariantDraft((prev) => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index),
        }));
    };

    const handleAddVariant = () => {
        const attributeMap = new Map();

        variantDraft.attributes.forEach(({ key, value }) => {
            const k = key.trim();
            const v = value.trim();
            if (k && v) attributeMap.set(k, v);
        });

        const nextVariant = {
            images: variantDraft.newImageFiles.map((item) => ({
                url: item.preview,
                file: item.file,
            })),
            stock: Number(variantDraft.stock || 0),
            attributes: attributeMap,
            price: {
                amount: Number(variantDraft.price.amount || 0),
                currency: variantDraft.price.currency,
            },
        };

        setVariants((prev) => [...prev, nextVariant]);
        setVariantDraft({ ...emptyVariantDraft, newImageFiles: [] });
    };

    const handleDeleteVariant = (index) => {
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const buildFinalFormData = () => {
        const formData = new FormData();

        formData.append("title", mainForm.title);
        formData.append("description", mainForm.description);
        formData.append("type", mainForm.type);

        const variantsMetadata = variants.map((variant) => ({
            stock: Number(variant.stock || 0),
            attributes:
                variant.attributes instanceof Map
                    ? Object.fromEntries(variant.attributes.entries())
                    : variant.attributes || {},
            price: {
                amount: Number(variant?.price?.amount || 0),
                currency: variant?.price?.currency || "INR",
            },
            existingImages: (variant?.images || [])
                .map((img) => img?.url || img)
                .filter(Boolean),
        }));

        formData.append("variantsData", JSON.stringify(variantsMetadata));

        variants.forEach((variant, vIndex) => {
            (variant?.images || []).forEach((img) => {
                if (img?.file) {
                    formData.append(`variantImages_${vIndex}`, img.file);
                }
            });
        });

        return formData;
    };

    const handleSaveAll = async (e) => {
        e.preventDefault();
        setSavingProduct(true);

        try {
            const finalFormData = buildFinalFormData();
            const res = await handelEditProduct(productId, finalFormData);

            if (res.status === 200) {
                toast.success(res.data.message || "Product updated successfully");
                navigate("/dashboard");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update product");
        } finally {
            setSavingProduct(false);
        }
    };

    const openDeleteDialog = () => setShowDeleteDialog(true);
    const closeDeleteDialog = () => setShowDeleteDialog(false);

    const confirmDeleteProduct = async () => {
        setDeletingProduct(true);
        try {
            await handelDeleteProduct(productId);
            setShowDeleteDialog(false);
            navigate(-1);
        } finally {
            setDeletingProduct(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            <header className="border-b border-black/5 bg-white text-zinc-900 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717] shadow-sm">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                                Stnitch
                            </p>
                            <h1 className="text-lg font-semibold">Edit product</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={openDeleteDialog}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                {loading || !product ? (
                    <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9dd] text-[#171717]">
                            <LifeBuoy className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900">Loading product</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                            Fetching product details and preparing the editor.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSaveAll} className="space-y-8">
                        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                            <div className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                                            Base item
                                        </p>
                                        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                                            Core details
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                                            Update the listing title and description here.
                                        </p>
                                    </div>

                                    <div className="hidden rounded-2xl border border-black/5 bg-[#faf8f5] px-4 py-3 text-right md:block">
                                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                                            Type
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-zinc-800">
                                            {mainForm.type}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                                            Title
                                        </label>
                                        <div className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-[#fdfbf7] px-4 py-3">
                                            <Type className="h-4 w-4 text-zinc-400" />
                                            <input
                                                value={mainForm.title}
                                                onChange={(e) =>
                                                    setMainForm((prev) => ({
                                                        ...prev,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                type="text"
                                                className="w-full bg-transparent text-sm text-zinc-800 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                                            Type
                                        </label>
                                        <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-[#fdfbf7] px-4 py-3">
                                            <Edit3 className="h-4 w-4 text-zinc-400" />
                                            <select
                                                value={mainForm.type}
                                                onChange={(e) =>
                                                    setMainForm((prev) => ({
                                                        ...prev,
                                                        type: e.target.value,
                                                    }))
                                                }
                                                className="w-full bg-transparent text-sm text-zinc-800 outline-none cursor-pointer"
                                            >
                                                <option value="tops">Tops</option>
                                                <option value="bottoms">Bottoms</option>
                                                <option value="shoes">Shoes</option>
                                                <option value="accessories">Accessories</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                                        Description
                                    </label>
                                    <div className="rounded-2xl border border-black/5 bg-[#fdfbf7] px-4 py-3 transition focus-within:border-black/20">
                                        <textarea
                                            value={mainForm.description}
                                            onChange={(e) =>
                                                setMainForm((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                            rows={6}
                                            className="w-full resize-none bg-transparent text-sm text-zinc-800 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-black/5 bg-[#faf8f5] p-4">
                                        <p className="text-sm text-zinc-500">Variants</p>
                                        <p className="mt-1 text-2xl font-semibold text-zinc-900">
                                            {stats.totalVariants}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-black/5 bg-[#faf8f5] p-4">
                                        <p className="text-sm text-zinc-500">Variant images</p>
                                        <p className="mt-1 text-2xl font-semibold text-zinc-900">
                                            {stats.totalImages}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                                            Product
                                        </p>
                                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                                            Variants
                                        </h3>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-[#fdfbf7] px-3 py-1.5 text-xs font-medium text-zinc-600">
                                        <Eye className="h-3.5 w-3.5" />
                                        View only
                                    </div>
                                </div>

                                {variants.length === 0 ? (
                                    <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-[#faf8f5] p-6 text-sm text-zinc-500">
                                        No variants added yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {variants.map((variant, index) => {
                                            const firstImage = variant?.images?.[0]?.url || variant?.images?.[0];
                                            const attrs = normalizeAttributes(variant?.attributes);

                                            return (
                                                <div
                                                    key={variant?._id || index}
                                                    className="rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-4"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-20 w-16 overflow-hidden rounded-2xl border border-black/5 bg-white shrink-0">
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

                                                        <div className="min-w-0 flex-1 space-y-3">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-zinc-900">
                                                                        Variant {index + 1}
                                                                    </p>
                                                                    <p className="mt-1 text-xs text-zinc-500">
                                                                        Stock: {variant?.stock ?? 0}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteVariant(index)}
                                                                    className="inline-flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-[#f4f1eb] cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Delete
                                                                </button>
                                                            </div>

                                                            <div className="grid gap-2 sm:grid-cols-2">
                                                                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm">
                                                                    <p className="text-zinc-500">Price</p>
                                                                    <p className="mt-1 font-medium text-zinc-900">
                                                                        {variant?.price?.currency || "INR"}{" "}
                                                                        {variant?.price?.amount ?? 0}
                                                                    </p>
                                                                </div>

                                                                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm">
                                                                    <p className="text-zinc-500">Attributes</p>
                                                                    <p className="mt-1 font-medium text-zinc-900">
                                                                        {attrs.length || 0}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {attrs.length > 0 && (
                                                                <div className="rounded-2xl border border-black/5 bg-white p-4">
                                                                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                                                                        Details
                                                                    </p>
                                                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                                        {attrs.map(([key, value]) => (
                                                                            <div
                                                                                key={key}
                                                                                className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-[#faf8f5] px-3 py-2 text-sm"
                                                                            >
                                                                                <span className="font-medium text-zinc-900">
                                                                                    {key}
                                                                                </span>
                                                                                <span className="text-zinc-600">
                                                                                    {value}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                                        New variant
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                                        Add a replacement or extra option
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                                        Existing variants cannot be edited. Delete one first, then add a new variant if needed.
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-[#fdfbf7] px-3 py-1.5 text-xs font-medium text-zinc-600">
                                    <CopyPlus className="h-3.5 w-3.5" />
                                    Draft
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-[#faf8f5] px-4 py-8 text-center transition hover:bg-[#f5f1eb]">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-[#fdfbf7] text-zinc-700">
                                        <ImagePlus className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-800">
                                        Upload variant images
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                        At least one image is recommended for a variant.
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleVariantDraftImagesUpload}
                                        className="hidden"
                                    />
                                </label>

                                <div className="space-y-4 rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-5">
                                    {variantDraft.newImageFiles.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {variantDraft.newImageFiles.map((img, index) => (
                                                <div
                                                    key={img.id}
                                                    className="relative overflow-hidden rounded-2xl border border-black/5 bg-white"
                                                >
                                                    <img
                                                        src={img.preview}
                                                        alt={`variant-draft-${index}`}
                                                        className="h-24 w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVariantDraftImageRemove(index)}
                                                        className="absolute right-2 top-2 cursor-pointer rounded-lg border border-black/5 bg-white/90 p-1.5 text-zinc-700 shadow-sm"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                                Stock
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={variantDraft.stock}
                                                onChange={(e) =>
                                                    setVariantDraft((prev) => ({
                                                        ...prev,
                                                        stock: e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-zinc-800 outline-none"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-zinc-700">
                                                Currency
                                            </label>
                                            <select
                                                value={variantDraft.price.currency}
                                                onChange={(e) =>
                                                    setVariantDraft((prev) => ({
                                                        ...prev,
                                                        price: {
                                                            ...prev.price,
                                                            currency: e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-zinc-800 outline-none cursor-pointer"
                                            >
                                                {currencyOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                                            Variant price
                                        </label>
                                        <div className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 transition focus-within:border-black/20">
                                            <CurrentCurrencyIcon className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variantDraft.price.amount}
                                                onChange={(e) =>
                                                    setVariantDraft((prev) => ({
                                                        ...prev,
                                                        price: {
                                                            ...prev.price,
                                                            amount: e.target.value,
                                                        },
                                                    }))
                                                }
                                                className="w-full bg-transparent text-sm text-zinc-800 outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <label className="block text-sm font-medium text-zinc-700">
                                                Attributes
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addVariantAttribute}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-[#f4f1eb] cursor-pointer"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add attribute
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {variantDraft.attributes.map((attr, index) => (
                                                <div
                                                    key={`attr-${index}`}
                                                    className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                                                >
                                                    <input
                                                        value={attr.key}
                                                        onChange={(e) =>
                                                            updateVariantAttribute(
                                                                index,
                                                                "key",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. color"
                                                        className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-zinc-800 outline-none"
                                                    />
                                                    <input
                                                        value={attr.value}
                                                        onChange={(e) =>
                                                            updateVariantAttribute(
                                                                index,
                                                                "value",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. black"
                                                        className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-zinc-800 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariantAttribute(index)}
                                                        className="inline-flex items-center justify-center rounded-2xl border border-black/5 bg-white px-3 py-3 text-zinc-700 transition hover:bg-[#f4f1eb] cursor-pointer"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddVariant}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add variant
                                    </button>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={savingProduct}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#171717] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                {savingProduct ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Save changes
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-6 shadow-2xl">
                        <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                            Delete product?
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            This will remove the entire product and all of its variants. This action cannot be undone.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteDialog}
                                className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteProduct}
                                disabled={deletingProduct}
                                className="flex-1 rounded-2xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                                {deletingProduct ? "Deleting..." : "Yes, delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerProductEdit;