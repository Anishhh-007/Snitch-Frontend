import React, { useEffect, useMemo, useState } from "react";
import {
    AlignLeft,
    DollarSign,
    Euro,
    ImagePlus,
    IndianRupee,
    JapaneseYen,
    PencilLine,
    Plus,
    PoundSterling,
    Shirt,
    Sparkles,
    Tag,
    Trash2,
    Type,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useProduct } from "../hook/useProducts";

const currencyIcons = {
    USD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling,
    JPY: JapaneseYen,
    INR: IndianRupee,
};

const makeVariant = () => ({
    id: crypto.randomUUID(),
    currency: "USD",
    price: "",
    stock: "",
    attributes: [{ key: "", value: "" }],
    images: [],
});

const CreateProduct = () => {
    const sellerLoading = useSelector((state) => state.product.sellerLoading);
    const { handelCreateProduct } = useProduct();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("tops");
    const [draftVariant, setDraftVariant] = useState(makeVariant());
    const [createdVariants, setCreatedVariants] = useState([]);

    useEffect(() => {
        return () => {
            draftVariant.images.forEach((image) => {
                if (image?.preview) URL.revokeObjectURL(image.preview);
            });
            createdVariants.forEach((variant) => {
                variant.images.forEach((image) => {
                    if (image?.preview) URL.revokeObjectURL(image.preview);
                });
            });
        };
    }, [draftVariant.images, createdVariants]);

    const totalImages = useMemo(
        () =>
            createdVariants.reduce((sum, variant) => sum + variant.images.length, 0) +
            draftVariant.images.length,
        [createdVariants, draftVariant.images]
    );

    const updateDraftVariant = (updater) => {
        setDraftVariant((prev) => updater(prev));
    };

    const addAttributeRow = () => {
        updateDraftVariant((variant) => ({
            ...variant,
            attributes: [...variant.attributes, { key: "", value: "" }],
        }));
    };

    const updateAttribute = (index, field, value) => {
        updateDraftVariant((variant) => {
            const nextAttributes = variant.attributes.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            );
            return { ...variant, attributes: nextAttributes };
        });
    };

    const removeAttributeRow = (index) => {
        updateDraftVariant((variant) => {
            const nextAttributes = variant.attributes.filter((_, i) => i !== index);
            return {
                ...variant,
                attributes: nextAttributes.length ? nextAttributes : [{ key: "", value: "" }],
            };
        });
    };

    const handleVariantImages = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        updateDraftVariant((variant) => {
            const remainingSlots = 8 - variant.images.length;
            const nextFiles = files.slice(0, remainingSlots).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));

            return {
                ...variant,
                images: [...variant.images, ...nextFiles],
            };
        });

        e.target.value = "";
    };

    const removeDraftImage = (imageIndex) => {
        updateDraftVariant((variant) => {
            const imageToRemove = variant.images[imageIndex];
            if (imageToRemove?.preview) URL.revokeObjectURL(imageToRemove.preview);

            return {
                ...variant,
                images: variant.images.filter((_, index) => index !== imageIndex),
            };
        });
    };

    const resetDraft = () => {
        setDraftVariant(makeVariant());
    };

    const addVariantToPreview = () => {
        const hasRequiredFields =
            draftVariant.stock !== "" &&
            Number(draftVariant.stock) >= 0 &&
            draftVariant.price !== "" &&
            Number(draftVariant.price) >= 0 &&
            draftVariant.images.length > 0 &&
            draftVariant.attributes.some((attr) => attr.key.trim() && attr.value.trim());

        if (!hasRequiredFields) return;

        setCreatedVariants((prev) => [...prev, draftVariant]);
        resetDraft();
    };

    const removeCreatedVariant = (variantId) => {
        setCreatedVariants((prev) => {
            const target = prev.find((variant) => variant.id === variantId);
            if (target) {
                target.images.forEach((image) => {
                    if (image?.preview) URL.revokeObjectURL(image.preview);
                });
            }
            return prev.filter((variant) => variant.id !== variantId);
        });
    };

    const isDraftValid =
        draftVariant.stock !== "" &&
        Number(draftVariant.stock) >= 0 &&
        draftVariant.price !== "" &&
        Number(draftVariant.price) >= 0 &&
        draftVariant.images.length > 0 &&
        draftVariant.attributes.some((attr) => attr.key.trim() && attr.value.trim());

    const canSubmit =
        title.trim() &&
        description.trim() &&
        createdVariants.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        const formdata = new FormData();
        formdata.append("title", title.trim());
        formdata.append("description", description.trim());
        formdata.append("type", type);

        const variantPayload = createdVariants.map((variant) => ({
            stock: Number(variant.stock),
            attributes: variant.attributes.reduce((acc, attr) => {
                if (attr.key.trim() && attr.value.trim()) {
                    acc[attr.key.trim()] = attr.value.trim();
                }
                return acc;
            }, {}),
            price: {
                amount: Number(variant.price),
                currency: variant.currency,
            },
        }));

        formdata.append("variants", JSON.stringify(variantPayload));

        createdVariants.forEach((variant, variantIndex) => {
            variant.images.forEach((imageObj) => {
                formdata.append(`variantImages_${variantIndex}`, imageObj.file);
            });
        });

        await handelCreateProduct(formdata);
    };

    const typeOptions = [
        { value: "tops", label: "Tops" },
        { value: "bottoms", label: "Bottoms" },
        { value: "shoes", label: "Shoes" },
        { value: "accessories", label: "Accessories" },
    ];

    const CurrencyIcon = currencyIcons[draftVariant.currency] || DollarSign;

    return (
        <div className="min-h-screen bg-[#f6f3ee] text-zinc-900">
            <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
                <main className="relative flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
                    <div className="absolute left-12 top-12 px-6 py-6 flex items-center gap-3 lg:left-10 lg:top-8">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-zinc-950 text-white shadow-sm">
                            <Shirt className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Stnitch</p>
                            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Create product</h1>
                        </div>
                    </div>

                    <div className="w-full max-w-3xl rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 pt-20 lg:pt-24">
                        <div className="mb-8 space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">New product</h2>
                            <p className="text-sm leading-6 text-zinc-500">
                                Fill the product details on the left, then add each variant to preview it on the right.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">Title</label>
                                    <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-black/25 focus-within:bg-white">
                                        <Type className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Product title"
                                            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700">Type</label>
                                    <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-black/25 focus-within:bg-white">
                                        <Tag className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full bg-transparent text-sm text-zinc-900 outline-none"
                                        >
                                            {typeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-700">Description</label>
                                <div className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 transition focus-within:border-black/25 focus-within:bg-white">
                                    <div className="mb-2 flex items-center gap-2 text-zinc-400 focus-within:text-zinc-600">
                                        <AlignLeft className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-[0.25em]">Details</span>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write a short description for the product..."
                                        rows={5}
                                        className="w-full resize-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                    />
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-black/10 bg-zinc-50 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-900">Create a variant</h3>
                                        <p className="text-sm text-zinc-500">Fill this block, then press Add variant to send it to the right panel.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addVariantToPreview}
                                        disabled={!isDraftValid}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add variant
                                    </button>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-700">Currency</label>
                                        <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25">
                                            <CurrencyIcon className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                            <select
                                                value={draftVariant.currency}
                                                onChange={(e) => updateDraftVariant((variant) => ({ ...variant, currency: e.target.value }))}
                                                className="w-full bg-transparent text-sm text-zinc-900 outline-none"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="JPY">JPY</option>
                                                <option value="INR">INR</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-700">Price</label>
                                        <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25">
                                            <CurrencyIcon className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={draftVariant.price}
                                                onChange={(e) => updateDraftVariant((variant) => ({ ...variant, price: e.target.value }))}
                                                placeholder="0.00"
                                                className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-700">Stock</label>
                                        <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25">
                                            <PencilLine className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={draftVariant.stock}
                                                onChange={(e) => updateDraftVariant((variant) => ({ ...variant, stock: e.target.value }))}
                                                placeholder="0"
                                                className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700">Attributes</label>
                                            <p className="text-xs text-zinc-500">Example: Size / M, Colour / Black</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addAttributeRow}
                                            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                                        >
                                            Add row
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {draftVariant.attributes.map((attr, attrIndex) => (
                                            <div key={attrIndex} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                                <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25">
                                                    <Type className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                                    <input
                                                        type="text"
                                                        value={attr.key}
                                                        onChange={(e) => updateAttribute(attrIndex, "key", e.target.value)}
                                                        placeholder="Attribute name"
                                                        className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                                    />
                                                </div>

                                                <div className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25">
                                                    <AlignLeft className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600" />
                                                    <input
                                                        type="text"
                                                        value={attr.value}
                                                        onChange={(e) => updateAttribute(attrIndex, "value", e.target.value)}
                                                        placeholder="Attribute value"
                                                        className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeAttributeRow(attrIndex)}
                                                    className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
                                                    aria-label="Remove attribute row"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <label className="block text-sm font-medium text-zinc-700">Images</label>
                                        <span className="text-xs text-zinc-500">{draftVariant.images.length}/8 selected</span>
                                    </div>

                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white px-4 py-7 text-center transition hover:bg-zinc-50">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-zinc-50 text-zinc-700 shadow-sm">
                                            <ImagePlus className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-medium text-zinc-900">Upload variant images</p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            JPG, PNG, and WebP. Add multiple images for the same variant.
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleVariantImages}
                                            className="hidden"
                                        />
                                    </label>

                                    {draftVariant.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                            {draftVariant.images.map((image, imageIndex) => (
                                                <div
                                                    key={`${draftVariant.id}-${image.file.name}-${imageIndex}`}
                                                    className="group relative overflow-hidden rounded-2xl border border-black/5 bg-zinc-50"
                                                >
                                                    <img src={image.preview} alt={image.file.name} className="h-28 w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDraftImage(imageIndex)}
                                                        className="absolute right-2 top-2 rounded-xl border border-black/5 bg-white/95 p-2 text-zinc-700 shadow-sm transition hover:bg-white"
                                                        aria-label="Remove image"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-600">
                                <p>
                                    Product images selected: <span className="font-semibold text-zinc-900">{totalImages}</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmit || sellerLoading}
                                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {sellerLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    "Create product"
                                )}
                            </button>
                        </form>
                    </div>
                </main>

                <aside className="relative hidden overflow-hidden border-l border-black/5  p-10 lg:flex lg:flex-col">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:36px_36px] opacity-50" />

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm">
                            <Shirt className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Created variants</h1>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 space-y-4 overflow-y-auto pr-1">


                        {createdVariants.length === 0 ? (
                            <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white p-6 text-sm text-zinc-500 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
                                No variants added yet. Fill the form on the left and press Add variant.
                            </div>
                        ) : (
                            createdVariants.map((variant, variantIndex) => {
                                const CreatedCurrencyIcon = currencyIcons[variant.currency] || DollarSign;
                                return (
                                    <section
                                        key={variant.id}
                                        className="rounded-[1.75rem] border border-black/10 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)]"
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                                                    Variant {variantIndex + 1}
                                                </p>
                                                <h4 className="text-base font-semibold text-zinc-900">Saved preview</h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeCreatedVariant(variant.id)}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3">
                                                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Currency</p>
                                                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-zinc-900">
                                                    <CreatedCurrencyIcon className="h-4 w-4 text-zinc-500" />
                                                    {variant.currency}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3">
                                                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Price</p>
                                                <div className="mt-2 text-sm font-medium text-zinc-900">{variant.price}</div>
                                            </div>

                                            <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3">
                                                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Stock</p>
                                                <div className="mt-2 text-sm font-medium text-zinc-900">{variant.stock}</div>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-700">Attributes</label>
                                                    <p className="text-xs text-zinc-500">Saved as created</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {variant.attributes
                                                    .filter((attr) => attr.key.trim() || attr.value.trim())
                                                    .map((attr, attrIndex) => (
                                                        <div
                                                            key={attrIndex}
                                                            className="flex items-center justify-between rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm"
                                                        >
                                                            <span className="font-medium text-zinc-900">{attr.key}</span>
                                                            <span className="text-zinc-500">{attr.value}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <label className="block text-sm font-medium text-zinc-700">Images</label>
                                                <span className="text-xs text-zinc-500">{variant.images.length} selected</span>
                                            </div>

                                            {variant.images.length > 0 && (
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {variant.images.map((image, imageIndex) => (
                                                        <div
                                                            key={`${variant.id}-${image.file.name}-${imageIndex}`}
                                                            className="overflow-hidden rounded-2xl border border-black/5 bg-zinc-50"
                                                        >
                                                            <img src={image.preview} alt={image.file.name} className="h-28 w-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                );
                            })
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CreateProduct;
