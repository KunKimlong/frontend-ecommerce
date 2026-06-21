"use client";
import {useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {CategoryService} from "@/service/category.service";
import {OptionService} from "@/service/option.service";
import {ProductService} from "@/service/product.service";
import {AssetService} from "@/service/asset.service";
import {CategoryData} from "@/type/Category";
import {OptionData, OptionValueData} from "@/type/Option";
import {AssetData} from "@/type/Asset";
import {ProductData} from "@/type/Product";
import AssetSelectorModal from "./AssetSelectorModal";

interface ProductOptionConfig {
    uid: string;
    id: number;
    title: string;
    values: { id: number; name: string }[];
    isCustom: boolean;
}

interface ProductFormProps {
    product?: ProductData;
}

export default function ProductForm({product}: ProductFormProps) {
    const router = useRouter();
    const isEdit = !!product;

    const [name, setName] = useState(product?.name ?? "");
    const [description, setDescription] = useState(product?.description ?? "");
    const [salePrice, setSalePrice] = useState<number | "">(product?.salePrice ?? "");
    const [categoryId, setCategoryId] = useState<number | "">(product?.category?.id ?? "");
    const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
    
    interface LocalProductVariant {
        id?: number;
        name: string;
        price: number;
        salePrice: number;
        stockQty: number;
        optionValueIds: number[];
        assetIds: number[];
        options: ProductOptionConfig[];
    }

    // Product Variants state
    const [variants, setVariants] = useState<LocalProductVariant[]>([]);

    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [options, setOptions] = useState<OptionData[]>([]);
    const [optionValues, setOptionValues] = useState<OptionValueData[]>([]);
    const [assets, setAssets] = useState<AssetData[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [activeVariantModalIndex, setActiveVariantModalIndex] = useState<number | null>(null);
    const [activeDropdownKey, setActiveDropdownKey] = useState<string | null>(null); // format: `${vIdx}-${rowUid}`
    const [dropdownSearchQuery, setDropdownSearchQuery] = useState("");
    const nextTempIdRef = useRef(-1);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (product) {
            setSelectedAssetIds(product.assets?.map((a) => a.id) ?? []);
            if (product.variants) {
                setVariants(
                    product.variants.map((v) => {
                        // Extract product options from this variant's option values
                        const optionMap: { [optionId: number]: { title: string; values: { id: number; name: string }[]; isCustom: boolean } } = {};
                        v.optionValues?.forEach(ov => {
                            if (!optionMap[ov.option.id]) {
                                optionMap[ov.option.id] = {
                                    title: ov.option.name,
                                    values: [],
                                    isCustom: false
                                };
                            }
                            if (!optionMap[ov.option.id].values.some(val => val.id === ov.id)) {
                                optionMap[ov.option.id].values.push({ id: ov.id, name: ov.name });
                            }
                        });

                        const variantOptions: ProductOptionConfig[] = Object.keys(optionMap).map(optIdStr => {
                            const optId = Number(optIdStr);
                            const item = optionMap[optId];
                            return {
                                uid: `${v.id ?? "variant"}-${optId}`,
                                id: optId,
                                title: item.title,
                                isCustom: false,
                                values: item.values
                            };
                        });

                        return {
                            id: v.id,
                            name: v.name,
                            price: v.price,
                            salePrice: v.salePrice,
                            stockQty: v.stockQty,
                            optionValueIds: v.optionValues?.map((ov) => ov.id) ?? [],
                            assetIds: v.assets?.map((a) => a.id) ?? [],
                            options: variantOptions
                        };
                    })
                );
            }
        }
    }, [product]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [catRes, optRes, valRes, assetRes] = await Promise.all([
                    CategoryService.getAll(0, 100),
                    OptionService.getAll(0, 100),
                    OptionService.getAllValues(0, 100),
                    AssetService.getAll(0, 100),
                ]);
                setCategories(catRes.data ?? catRes);
                setOptions(optRes.data ?? optRes);
                setOptionValues(valRes.data ?? valRes);
                setAssets(assetRes.data ?? assetRes);
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchOptions();
    }, []);

    // Medusa-style options card handlers & effects
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (activeDropdownKey !== null) {
                const target = e.target as HTMLElement;
                if (!target.closest(".title-container")) {
                    setActiveDropdownKey(null);
                }
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [activeDropdownKey]);

    const syncOptionValueIds = (variantOptions: ProductOptionConfig[]): number[] => {
        const ids: number[] = [];
        variantOptions.forEach(opt => {
            opt.values.forEach(v => {
                ids.push(v.id);
            });
        });
        return ids;
    };

    const handleAddOption = (vIdx: number) => {
        const newTempId = nextTempIdRef.current;
        nextTempIdRef.current -= 1;
        const newUid = `new-${Math.abs(newTempId)}`;

        setVariants(vars => vars.map((v, i) => {
            if (i === vIdx) {
                if (v.options.length >= 3) return v;
                const updatedOptions = [...v.options, { uid: newUid, id: newTempId, title: "", values: [], isCustom: false }];
                return {
                    ...v,
                    options: updatedOptions,
                    optionValueIds: syncOptionValueIds(updatedOptions)
                };
            }
            return v;
        }));
        setActiveDropdownKey(`${vIdx}-${newUid}`);
        setDropdownSearchQuery("");
    };

    const handleSelectOption = (vIdx: number, rowUid: string, optionName: string) => {
        const existingOpt = options.find((o) => o.name.toLowerCase() === optionName.toLowerCase());
        if (existingOpt) {
            setVariants(prev => prev.map((v, i) => {
                if (i === vIdx) {
                    const updatedOptions = v.options.map((row) =>
                        row.uid === rowUid
                            ? { ...row, id: existingOpt.id, title: existingOpt.name, isCustom: false, values: [] }
                            : row
                    );
                    return {
                        ...v,
                        options: updatedOptions,
                        optionValueIds: syncOptionValueIds(updatedOptions)
                    };
                }
                return v;
            }));
            setActiveDropdownKey(null);
        } else {
            handleCreateCustomOption(vIdx, rowUid, optionName);
        }
    };

    const handleCreateCustomOption = async (vIdx: number, rowUid: string, optionName: string) => {
        setLoading(true);
        try {
            const newOpt = await OptionService.save({ name: optionName });
            setOptions((prev) => [...prev, newOpt]);
            setVariants(prev => prev.map((v, i) => {
                if (i === vIdx) {
                    const updatedOptions = v.options.map((row) =>
                        row.uid === rowUid
                            ? { ...row, id: newOpt.id, title: newOpt.name, isCustom: true, values: [] }
                            : row
                    );
                    return {
                        ...v,
                        options: updatedOptions,
                        optionValueIds: syncOptionValueIds(updatedOptions)
                    };
                }
                return v;
            }));
            setActiveDropdownKey(null);
        } catch (err: any) {
            setError(err.message || "Failed to create option");
        } finally {
            setLoading(false);
        }
    };

    const handleAddOptionValue = async (vIdx: number, rowUid: string, optionId: number, valueName: string) => {
        if (!valueName.trim() || optionId <= 0) return;
        setLoading(true);
        try {
            const existingVal = optionValues.find(
                (v) => v.option.id === optionId && v.name.toLowerCase() === valueName.toLowerCase()
            );

            let valToUse;
            if (existingVal) {
                valToUse = { id: existingVal.id, name: existingVal.name };
            } else {
                const newVal = await OptionService.saveValue({ name: valueName, optionId });
                setOptionValues((prev) => [...prev, newVal]);
                valToUse = { id: newVal.id, name: newVal.name };
            }

            setVariants(prev => prev.map((v, i) => {
                if (i === vIdx) {
                    const updatedOptions = v.options.map((row) => {
                        if (row.uid === rowUid) {
                            if (row.values.some((val) => val.id === valToUse.id)) return row;
                            return { ...row, values: [...row.values, valToUse] };
                        }
                        return row;
                    });
                    return {
                        ...v,
                        options: updatedOptions,
                        optionValueIds: syncOptionValueIds(updatedOptions)
                    };
                }
                return v;
            }));
        } catch (err: any) {
            setError(err.message || "Failed to add option value");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveOptionValue = (vIdx: number, rowUid: string, valId: number) => {
        setVariants(prev => prev.map((v, i) => {
            if (i === vIdx) {
                const updatedOptions = v.options.map((row) => {
                    if (row.uid === rowUid) {
                        return { ...row, values: row.values.filter((val) => val.id !== valId) };
                    }
                    return row;
                });
                return {
                    ...v,
                    options: updatedOptions,
                    optionValueIds: syncOptionValueIds(updatedOptions)
                };
            }
            return v;
        }));
    };

    const handleDeleteOptionRow = (vIdx: number, rowUid: string) => {
        setVariants(prev => prev.map((v, i) => {
            if (i === vIdx) {
                const updatedOptions = v.options.filter((row) => row.uid !== rowUid);
                return {
                    ...v,
                    options: updatedOptions,
                    optionValueIds: syncOptionValueIds(updatedOptions)
                };
            }
            return v;
        }));
        if (activeDropdownKey === `${vIdx}-${rowUid}`) {
            setActiveDropdownKey(null);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, _index: number) => {
        e.preventDefault();
    };

    const handleDrop = (vIdx: number, index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;
        setVariants(prev => prev.map((v, i) => {
            if (i === vIdx) {
                const reordered = [...v.options];
                const [moved] = reordered.splice(draggedIndex, 1);
                reordered.splice(index, 0, moved);
                return {
                    ...v,
                    options: reordered
                };
            }
            return v;
        }));
        setDraggedIndex(null);
    };

    const toggleAsset = (id: number) =>
        setSelectedAssetIds((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

    const handleAssetUploaded = (newAsset: AssetData) => {
        setAssets((prev) => [newAsset, ...prev]);
    };

    const selectedAssets = useMemo(() => {
        return selectedAssetIds
            .map(id => assets.find(a => a.id === id))
            .filter((a): a is AssetData => !!a);
    }, [assets, selectedAssetIds]);

    const handleAddVariant = () => {
        setVariants(prev => [
            ...prev,
            {
                name: "",
                price: 0,
                salePrice: 0,
                stockQty: 0,
                optionValueIds: [],
                assetIds: [],
                options: []
            }
        ]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, key: keyof LocalProductVariant, value: any) => {
        setVariants(prev => prev.map((v, i) => i === index ? {...v, [key]: value} : v));
    };

    const handleVariantAssetToggle = (variantIndex: number, assetId: number) => {
        setVariants(prev => prev.map((v, i) => {
            if (i === variantIndex) {
                const alreadySelected = v.assetIds.includes(assetId);
                const updatedAssetIds = alreadySelected 
                    ? v.assetIds.filter(id => id !== assetId)
                    : [...v.assetIds, assetId];
                return {...v, assetIds: updatedAssetIds};
            }
            return v;
        }));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Product name is required");
            return;
        }
        if (salePrice === "" || salePrice < 0) {
            setError("Product sale price is required and must be non-negative");
            return;
        }
        if (categoryId === "") {
            setError("Category is required");
            return;
        }

        // Validate variants
        if (variants.length === 0) {
            setError("At least one product variant is required");
            return;
        }

        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.name.trim()) {
                setError(`Variant #${i + 1} name is required`);
                return;
            }
            if (v.price < 0 || v.salePrice < 0 || v.stockQty < 0) {
                setError(`Variant #${i + 1} contains negative prices or stock`);
                return;
            }
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                name,
                description,
                salePrice: Number(salePrice),
                categoryId: Number(categoryId),
                variants: variants.map(v => ({
                    id: v.id,
                    name: v.name,
                    price: Number(v.price),
                    salePrice: Number(v.salePrice),
                    stockQty: Number(v.stockQty),
                    optionValueIds: v.optionValueIds,
                    assetIds: v.assetIds
                })),
                assetIds: selectedAssetIds,
            };

            if (isEdit && product) {
                await ProductService.update(product.id, payload);
            } else {
                await ProductService.save(payload);
            }

            router.push("/product");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";
    const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

    return (
        <div>
            <PageBreadcrumb pageTitle={isEdit ? "Edit Product" : "Add Product"}/>
            <div className="space-y-6">
                <ComponentCard>
                    <div className="p-6 lg:p-8 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label htmlFor="product-name" className={labelClass}>Product Name</label>
                            <input
                                id="product-name"
                                type="text"
                                placeholder="Enter product name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="product-description" className={labelClass}>Description</label>
                            <textarea
                                id="product-description"
                                placeholder="Enter product description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                rows={3}
                                className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>

                        {/* Pricing & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sale-price" className={labelClass}>Product Sale Price</label>
                                <input
                                    id="sale-price"
                                    type="number"
                                    min={0}
                                    placeholder="0.00"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className={labelClass}>Category</label>
                                <select
                                    id="category"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                    className={inputClass}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Media Gallery */}
                        <div>
                            <label className={labelClass}>
                                Product Media Gallery
                                {selectedAssetIds.length > 0 && (
                                    <span className="ml-2 text-xs text-brand-600 dark:text-brand-400 font-normal">
                                        ({selectedAssetIds.length} selected)
                                    </span>
                                )}
                            </label>

                            {selectedAssets.length === 0 ? (
                                <div
                                    onClick={() => setIsAssetModalOpen(true)}
                                    className="mt-1 flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900/30 dark:hover:border-brand-500 cursor-pointer transition-all duration-200 group text-center"
                                >
                                    <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-brand-500 dark:text-brand-400"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        No gallery images selected
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                        Click here to choose existing images from your library or upload new files.
                                    </p>
                                    <button
                                        type="button"
                                        className="mt-3 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-theme-xs transition-colors cursor-pointer"
                                    >
                                        Choose Images
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                                    {selectedAssets.map((asset, index) => {
                                        const isCover = index === 0;
                                        return (
                                            <div
                                                key={asset.id}
                                                className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-900 ${
                                                    isCover
                                                        ? "border-brand-500 ring-2 ring-brand-500/10 shadow-sm"
                                                        : "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700"
                                                }`}
                                            >
                                                <img
                                                    src={"/media" + asset.path}
                                                    alt={asset.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {isCover && (
                                                    <div className="absolute top-2 left-2 bg-brand-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow z-10">
                                                        Cover
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAsset(asset.id)}
                                                    disabled={loading}
                                                    title="Remove image"
                                                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-850 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-105 cursor-pointer z-10"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="w-3.5 h-3.5"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 truncate">
                                                    <p className="text-[9px] text-white text-center truncate font-medium">
                                                        {asset.name}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={() => setIsAssetModalOpen(true)}
                                        disabled={loading}
                                        className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-6 h-6 text-gray-400 group-hover:text-brand-500"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        <span className="text-[10px] font-semibold text-gray-500 uppercase mt-1">
                                            Manage
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Variants Management */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Product Variants</h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddVariant}
                                    disabled={loading}
                                >
                                    + Add Variant manually
                                </Button>
                            </div>

                            {variants.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No variants added yet. Click "+ Add Variant" to build a variant.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {variants.map((variant, vIdx) => {
                                        return (
                                            <div key={vIdx} className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 relative space-y-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(vIdx)}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Remove variant"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>

                                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Variant #{vIdx + 1}</h4>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {/* Variant Name */}
                                                    <div className="md:col-span-2">
                                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Variant Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Red - XL"
                                                            value={variant.name}
                                                            onChange={(e) => handleVariantChange(vIdx, "name", e.target.value)}
                                                            disabled={loading}
                                                            className={inputClass}
                                                        />
                                                    </div>

                                                    {/* Price */}
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Base Price</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0.00"
                                                            value={variant.price}
                                                            onChange={(e) => handleVariantChange(vIdx, "price", Number(e.target.value))}
                                                            disabled={loading}
                                                            className={inputClass}
                                                        />
                                                    </div>

                                                    {/* Sale Price */}
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Variant Sale Price</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0.00"
                                                            value={variant.salePrice}
                                                            onChange={(e) => handleVariantChange(vIdx, "salePrice", Number(e.target.value))}
                                                            disabled={loading}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                                    {/* Stock Qty */}
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Stock Quantity</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            value={variant.stockQty}
                                                            onChange={(e) => handleVariantChange(vIdx, "stockQty", Number(e.target.value))}
                                                            disabled={loading}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Product Options Management inside Variant Card */}
                                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <div className="mb-3">
                                                        <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">Variant Options</h5>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                            Define the options and values for this specific variant.
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {variant.options.map((row, index) => {
                                                            const availablePredefined = options
                                                                .map((o) => o.name)
                                                                .filter(
                                                                    (title) => title === row.title || !variant.options.some((r) => r.title.toLowerCase() === title.toLowerCase())
                                                                );

                                                            return (
                                                                <div
                                                                    key={row.uid}
                                                                    draggable
                                                                    onDragStart={() => handleDragStart(index)}
                                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                                    onDrop={() => handleDrop(vIdx, index)}
                                                                    className={`flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 relative transition-opacity duration-150 ${
                                                                        draggedIndex === index ? "opacity-40" : ""
                                                                    }`}
                                                                >
                                                                    {/* Drag Handle */}
                                                                    <div className="flex items-center justify-center w-6 h-8 cursor-grab text-gray-400 active:cursor-grabbing">
                                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M7 6H13M7 10H13M7 14H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                        </svg>
                                                                    </div>

                                                                    {/* Title Searchable Dropdown */}
                                                                    <div className="title-container relative w-[180px]">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const key = `${vIdx}-${row.uid}`;
                                                                                setActiveDropdownKey(activeDropdownKey === key ? null : key);
                                                                                setDropdownSearchQuery("");
                                                                            }}
                                                                            className="flex items-center justify-between w-full h-8 px-3 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-500 cursor-pointer"
                                                                        >
                                                                            <span className="truncate">{row.title || "Select option"}</span>
                                                                            {row.isCustom && (
                                                                                <span className="ml-1.5 px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 text-[9px] font-semibold rounded-md">
                                                                                    Custom
                                                                                </span>
                                                                            )}
                                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-gray-400">
                                                                                <path d="M6 9l6 6 6-6"/>
                                                                            </svg>
                                                                        </button>

                                                                        {activeDropdownKey === `${vIdx}-${row.uid}` && (
                                                                            <div className="absolute top-9 left-0 right-0 z-50 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-black/30 flex flex-col gap-1.5 w-[200px]">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Search..."
                                                                                    value={dropdownSearchQuery}
                                                                                    onChange={(e) => setDropdownSearchQuery(e.target.value)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-brand-500"
                                                                                />
                                                                                <div className="max-h-[140px] overflow-y-auto flex flex-col gap-0.5">
                                                                                    {availablePredefined
                                                                                        .filter((title) => title.toLowerCase().includes(dropdownSearchQuery.toLowerCase()))
                                                                                        .map((title) => (
                                                                                            <button
                                                                                                key={title}
                                                                                                type="button"
                                                                                                onClick={() => handleSelectOption(vIdx, row.uid, title)}
                                                                                                className="flex items-center w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-left"
                                                                                            >
                                                                                                {title}
                                                                                            </button>
                                                                                        ))}

                                                                                    {dropdownSearchQuery.trim() &&
                                                                                        !availablePredefined.some((title) => title.toLowerCase() === dropdownSearchQuery.trim().toLowerCase()) && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleSelectOption(vIdx, row.uid, dropdownSearchQuery.trim())}
                                                                                                className="flex items-center justify-between w-full px-2 py-1.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md text-left font-medium"
                                                                                            >
                                                                                                <span>Create "{dropdownSearchQuery.trim()}"</span>
                                                                                                <span className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-[9px] rounded-md font-semibold">
                                                                                                    Custom
                                                                                                </span>
                                                                                            </button>
                                                                                        )}

                                                                                    {availablePredefined.filter((title) => title.toLowerCase().includes(dropdownSearchQuery.toLowerCase())).length === 0 && !dropdownSearchQuery.trim() && (
                                                                                        <span className="p-2 text-center text-[10px] text-gray-400 dark:text-gray-500">
                                                                                            No options available
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Tag/Chip Input for Values */}
                                                                    <div className="values-container flex-1 min-w-0">
                                                                        <div
                                                                            onClick={(e) => {
                                                                                const input = e.currentTarget.querySelector("input");
                                                                                if (input) input.focus();
                                                                            }}
                                                                            className="flex flex-wrap gap-1.5 p-1 border border-gray-300 dark:border-gray-700 rounded-lg min-h-8 bg-white dark:bg-gray-900 cursor-text items-center"
                                                                        >
                                                                            {row.values.map((val) => (
                                                                                <div
                                                                                    key={val.id}
                                                                                    className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-800 dark:text-white"
                                                                                >
                                                                                    <span>{val.name}</span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleRemoveOptionValue(vIdx, row.uid, val.id);
                                                                                        }}
                                                                                        className="text-gray-400 hover:text-gray-655 dark:hover:text-white font-bold text-sm"
                                                                                    >
                                                                                        &times;
                                                                                    </button>
                                                                                </div>
                                                                            ))}
                                                                            <input
                                                                                type="text"
                                                                                placeholder={row.values.length === 0 ? "Add values..." : ""}
                                                                                disabled={!row.title}
                                                                                onKeyDown={(e) => {
                                                                                    const target = e.currentTarget;
                                                                                    const value = target.value.trim();
                                                                                    if ((e.key === "Enter" || e.key === ",") && value) {
                                                                                        e.preventDefault();
                                                                                        handleAddOptionValue(vIdx, row.uid, row.id < 0 ? 0 : row.id, value);
                                                                                        target.value = "";
                                                                                    } else if (e.key === "Backspace" && !value && row.values.length > 0) {
                                                                                        e.preventDefault();
                                                                                        handleRemoveOptionValue(vIdx, row.uid, row.values[row.values.length - 1].id);
                                                                                    }
                                                                                }}
                                                                                onBlur={(e) => {
                                                                                    const target = e.currentTarget;
                                                                                    const value = target.value.trim();
                                                                                    if (value) {
                                                                                        handleAddOptionValue(vIdx, row.uid, row.id < 0 ? 0 : row.id, value);
                                                                                        target.value = "";
                                                                                    }
                                                                                }}
                                                                                className="flex-1 min-w-[60px] h-6 px-1 text-xs border-none outline-none bg-transparent dark:text-white"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Trash button */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteOptionRow(vIdx, row.uid)}
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors cursor-pointer"
                                                                        title="Delete option"
                                                                    >
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Add Option Trigger */}
                                                    <div className="mt-3 ml-9">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddOption(vIdx)}
                                                            disabled={variant.options.length >= 3 || loading}
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M7 2.91669V11.0834" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M2.91669 7H11.0834" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            Add option
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Variant assets selection */}
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                                        Associate Images with Variant
                                                        {variant.assetIds.length > 0 && (
                                                            <span className="ml-2 text-xs text-brand-600 dark:text-brand-400 font-normal">
                                                                ({variant.assetIds.length} selected)
                                                            </span>
                                                        )}
                                                    </label>
                                                    {(() => {
                                                        const varSelectedAssets = variant.assetIds
                                                            .map(id => assets.find(a => a.id === id))
                                                            .filter((a): a is AssetData => !!a);

                                                        return varSelectedAssets.length === 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveVariantModalIndex(vIdx)}
                                                                disabled={loading}
                                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-750 bg-gray-50 dark:bg-gray-900/30 hover:border-brand-500 hover:bg-brand-50 dark:hover:border-brand-500/10 text-xs font-medium text-gray-555 dark:text-gray-400 cursor-pointer transition-all"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-450">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                </svg>
                                                                Choose Variant Images
                                                            </button>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                {varSelectedAssets.map((asset) => {
                                                                    return (
                                                                        <div
                                                                            key={asset.id}
                                                                            className="group relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                                                                        >
                                                                            <img
                                                                                src={"/media" + asset.path}
                                                                                alt={asset.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleVariantAssetToggle(vIdx, asset.id)}
                                                                                disabled={loading}
                                                                                title="Remove image"
                                                                                className="absolute top-0.5 right-0.5 p-0.5 bg-white dark:bg-gray-850 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer z-10"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveVariantModalIndex(vIdx)}
                                                                    disabled={loading}
                                                                    className="flex items-center justify-center w-12 h-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-750 bg-gray-50 dark:bg-gray-900/30 hover:border-brand-500 hover:bg-brand-50 dark:hover:border-brand-500/10 cursor-pointer transition-all"
                                                                    title="Manage Images"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-brand-500">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Submit Button Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading
                                    ? isEdit ? "Updating..." : "Saving..."
                                    : isEdit ? "Update Product" : "+ Add Product"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push("/product")}
                                disabled={loading}
                                className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ComponentCard>
            </div>

            <AssetSelectorModal
                isOpen={isAssetModalOpen}
                onClose={() => setIsAssetModalOpen(false)}
                selectedIds={selectedAssetIds}
                onSelect={setSelectedAssetIds}
                assets={assets}
                onAssetUploaded={handleAssetUploaded}
            />

            <AssetSelectorModal
                isOpen={activeVariantModalIndex !== null}
                onClose={() => setActiveVariantModalIndex(null)}
                selectedIds={activeVariantModalIndex !== null ? variants[activeVariantModalIndex].assetIds : []}
                onSelect={(selectedIds) => {
                    if (activeVariantModalIndex !== null) {
                        handleVariantChange(activeVariantModalIndex, "assetIds", selectedIds);
                    }
                }}
                assets={assets}
                onAssetUploaded={handleAssetUploaded}
            />
        </div>
    );
}
