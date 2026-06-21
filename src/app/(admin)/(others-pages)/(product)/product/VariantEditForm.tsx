"use client";
import {useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {OptionService} from "@/service/option.service";
import {AssetService} from "@/service/asset.service";
import {VariantService} from "@/service/variant.service";
import {ProductService} from "@/service/product.service";
import {OptionData, OptionValueData} from "@/type/Option";
import {AssetData} from "@/type/Asset";
import {ProductVariantData} from "@/type/Product";
import AssetSelectorModal from "./AssetSelectorModal";

interface VariantOptionRow {
    uid: string;
    optionId: number;
    title: string;
    values: { id: number; name: string }[];
}

interface VariantEditFormProps {
    productId: number;
    variantId: number;
}

export default function VariantEditForm({productId, variantId}: VariantEditFormProps) {
    const router = useRouter();

    const [variant, setVariant] = useState<ProductVariantData | undefined>(undefined);
    const [productName, setProductName] = useState("");

    const [name, setName] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [salePrice, setSalePrice] = useState<number | "">("");
    const [stockQty, setStockQty] = useState<number | "">("");
    const [optionValueIds, setOptionValueIds] = useState<number[]>([]);
    const [assetIds, setAssetIds] = useState<number[]>([]);
    const [variantOptions, setVariantOptions] = useState<VariantOptionRow[]>([]);

    const [options, setOptions] = useState<OptionData[]>([]);
    const [optionValues, setOptionValues] = useState<OptionValueData[]>([]);
    const [assets, setAssets] = useState<AssetData[]>([]);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

    const [activeTitleDropdown, setActiveTitleDropdown] = useState<string | null>(null);
    const [titleSearchQuery, setTitleSearchQuery] = useState("");
    const [valueInputs, setValueInputs] = useState<Record<string, string>>({});
    const [valueDropdownOpen, setValueDropdownOpen] = useState<Record<string, boolean>>({});
    const valueDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const nextTempId = useRef(-1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [variantData, productData, optRes, valRes, assetRes] = await Promise.all([
                    VariantService.getById(variantId),
                    ProductService.getById(productId),
                    OptionService.getAll(0, 100),
                    OptionService.getAllValues(0, 100),
                    AssetService.getAll(0, 100),
                ]);
                setVariant(variantData);
                setProductName(productData.name);
                setName(variantData.name);
                setPrice(variantData.price);
                setSalePrice(variantData.salePrice);
                setStockQty(variantData.stockQty);
                setAssetIds(variantData.assets?.map((a) => a.id) ?? []);

                const ovs = variantData.optionValues ?? [];
                setOptionValueIds(ovs.map((ov) => ov.id));

                const optionMap = new Map<number, VariantOptionRow>();
                ovs.forEach((ov) => {
                    if (!optionMap.has(ov.option.id)) {
                        optionMap.set(ov.option.id, {
                            uid: `init-${ov.option.id}`,
                            optionId: ov.option.id,
                            title: ov.option.name,
                            values: [],
                        });
                    }
                    optionMap.get(ov.option.id)!.values.push({id: ov.id, name: ov.name});
                });
                setVariantOptions(Array.from(optionMap.values()));

                setOptions(optRes.data ?? optRes);
                setOptionValues(valRes.data ?? valRes);
                setAssets(assetRes.data ?? assetRes);
            } catch {
                setError("Failed to load variant");
            } finally {
                setFetchLoading(false);
            }
        };
        fetchData();
    }, [productId, variantId]);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            for (const uid of Object.keys(valueDropdownRefs.current)) {
                const el = valueDropdownRefs.current[uid];
                if (el && !el.contains(target)) {
                    setValueDropdownOpen((prev) => ({...prev, [uid]: false}));
                }
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const syncOptionValueIds = (rows: VariantOptionRow[]): number[] => {
        const ids: number[] = [];
        rows.forEach((row) => row.values.forEach((v) => ids.push(v.id)));
        return ids;
    };

    const handleAddOption = () => {
        if (variantOptions.length >= 3) return;
        const uid = `new-${Math.abs(nextTempId.current)}`;
        nextTempId.current -= 1;
        setVariantOptions((prev) => [...prev, {uid, optionId: 0, title: "", values: []}]);
        setActiveTitleDropdown(uid);
        setTitleSearchQuery("");
    };

    const handleDeleteOption = (uid: string) => {
        setVariantOptions((prev) => {
            const updated = prev.filter((row) => row.uid !== uid);
            setOptionValueIds(syncOptionValueIds(updated));
            return updated;
        });
    };

    const handleSelectOption = (uid: string, optionName: string) => {
        const existing = options.find((o) => o.name.toLowerCase() === optionName.toLowerCase());
        if (existing) {
            setVariantOptions((prev) => {
                const updated = prev.map((row) =>
                    row.uid === uid
                        ? {...row, optionId: existing.id, title: existing.name, values: []}
                        : row
                );
                setOptionValueIds(syncOptionValueIds(updated));
                return updated;
            });
            setActiveTitleDropdown(null);
        }
    };

    const handleAddOptionValue = (uid: string, valueName: string) => {
        const row = variantOptions.find((r) => r.uid === uid);
        if (!row || row.optionId <= 0 || !valueName.trim()) return;

        const existingVal = optionValues.find(
            (ov) => ov.option.id === row.optionId && ov.name.toLowerCase() === valueName.trim().toLowerCase()
        );

        if (existingVal) {
            if (row.values.some((v) => v.id === existingVal.id)) return;
            setVariantOptions((prev) => {
                const updated = prev.map((r) =>
                    r.uid === uid
                        ? {...r, values: [...r.values, {id: existingVal.id, name: existingVal.name}]}
                        : r
                );
                setOptionValueIds(syncOptionValueIds(updated));
                return updated;
            });
        }
    };

    const handleRemoveOptionValue = (uid: string, valId: number) => {
        setVariantOptions((prev) => {
            const updated = prev.map((row) =>
                row.uid === uid
                    ? {...row, values: row.values.filter((v) => v.id !== valId)}
                    : row
            );
            setOptionValueIds(syncOptionValueIds(updated));
            return updated;
        });
    };

    const availableForTitle = useMemo(() => {
        const usedTitles = variantOptions
            .filter((row) => row.title)
            .map((row) => row.title.toLowerCase());
        return options.filter((o) => !usedTitles.includes(o.name.toLowerCase()));
    }, [options, variantOptions]);

    const getAvailableValues = (uid: string) => {
        const row = variantOptions.find((r) => r.uid === uid);
        if (!row || row.optionId <= 0) return [];
        const selectedIds = row.values.map((v) => v.id);
        return optionValues.filter(
            (ov) => ov.option.id === row.optionId && !selectedIds.includes(ov.id)
        );
    };

    const toggleAsset = (id: number) => {
        setAssetIds((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
    };

    const handleAssetUploaded = (newAsset: AssetData) => {
        setAssets((prev) => [newAsset, ...prev]);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Variant name is required");
            return;
        }
        if (price === "" || price < 0) {
            setError("Price is required and must be non-negative");
            return;
        }
        if (salePrice === "" || salePrice < 0) {
            setError("Sale price is required and must be non-negative");
            return;
        }
        if (stockQty === "" || stockQty < 0) {
            setError("Stock quantity is required and must be non-negative");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await VariantService.update(variantId, {
                name,
                price: Number(price),
                salePrice: Number(salePrice),
                stockQty: Number(stockQty),
                optionValueIds,
                assetIds,
            });
            router.push(`/product/${productId}/variant/${variantId}`);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";
    const cardLabelClass = "text-xs font-semibold text-gray-500 mb-1 block";

    const groupedAssets = useMemo(() => {
        return assetIds.map((id) => assets.find((a) => a.id === id)).filter((a): a is AssetData => !!a);
    }, [assets, assetIds]);

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading variant...</p>
            </div>
        );
    }

    if (error && !variant) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Variant"/>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/product/${productId}/variant/${variantId}`)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd"/>
                        </svg>
                        Back to Variant Detail
                    </button>
                </div>

                <ComponentCard>
                    <div className="p-6 lg:p-8 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {productName && (
                            <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Editing variant for <span className="font-medium text-gray-700 dark:text-gray-300">{productName}</span>
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className={cardLabelClass}>Variant Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Red - XL"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={cardLabelClass}>Base Price</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={cardLabelClass}>Variant Sale Price</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="0.00"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={cardLabelClass}>Stock Quantity</label>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={stockQty}
                                    onChange={(e) => setStockQty(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 relative space-y-4">
                            <div className="mb-3">
                                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">Variant Options</h5>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Define the options and values for this specific variant.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {variantOptions.map((row) => {
                                    const availableVals = getAvailableValues(row.uid);
                                    return (
                                        <div
                                            key={row.uid}
                                            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 relative"
                                        >
                                            <div className="title-container relative w-[180px]">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const key = row.uid;
                                                        setActiveTitleDropdown(activeTitleDropdown === key ? null : key);
                                                        setTitleSearchQuery("");
                                                    }}
                                                    className="flex items-center justify-between w-full h-8 px-3 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-500 cursor-pointer"
                                                >
                                                    <span className="truncate">{row.title || "Select option"}</span>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-gray-400">
                                                        <path d="M6 9l6 6 6-6"/>
                                                    </svg>
                                                </button>

                                                {activeTitleDropdown === row.uid && (
                                                    <div className="absolute top-9 left-0 right-0 z-50 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-black/30 flex flex-col gap-1.5 w-[200px]">
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            placeholder="Search..."
                                                            value={titleSearchQuery}
                                                            onChange={(e) => setTitleSearchQuery(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="h-7 px-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-brand-500"
                                                        />
                                                        <div className="max-h-[140px] overflow-y-auto flex flex-col gap-0.5">
                                                            {availableForTitle
                                                                .filter((opt) => opt.name.toLowerCase().includes(titleSearchQuery.toLowerCase()))
                                                                .map((opt) => (
                                                                    <button
                                                                        key={opt.id}
                                                                        type="button"
                                                                        onClick={() => handleSelectOption(row.uid, opt.name)}
                                                                        className="flex items-center w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-left"
                                                                    >
                                                                        {opt.name}
                                                                    </button>
                                                                ))}
                                                            {availableForTitle.filter((opt) => opt.name.toLowerCase().includes(titleSearchQuery.toLowerCase())).length === 0 && !titleSearchQuery.trim() && (
                                                                <span className="p-2 text-center text-[10px] text-gray-400 dark:text-gray-500">No options available</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="values-container flex-1 min-w-0" ref={(el) => { valueDropdownRefs.current[row.uid] = el; }}>
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
                                                                    handleRemoveOptionValue(row.uid, val.id);
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
                                                        value={valueInputs[row.uid] ?? ""}
                                                        onChange={(e) => {
                                                            setValueInputs((prev) => ({...prev, [row.uid]: e.target.value}));
                                                        }}
                                                        onFocus={() => {
                                                            setValueDropdownOpen((prev) => ({...prev, [row.uid]: true}));
                                                        }}
                                                        onKeyDown={(e) => {
                                                            const value = e.currentTarget.value.trim();
                                                            if ((e.key === "Enter" || e.key === ",") && value) {
                                                                e.preventDefault();
                                                                handleAddOptionValue(row.uid, value);
                                                                setValueInputs((prev) => ({...prev, [row.uid]: ""}));
                                                            } else if (e.key === "Backspace" && !value && row.values.length > 0) {
                                                                e.preventDefault();
                                                                handleRemoveOptionValue(row.uid, row.values[row.values.length - 1].id);
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const value = e.target.value.trim();
                                                            if (value) {
                                                                handleAddOptionValue(row.uid, value);
                                                                setValueInputs((prev) => ({...prev, [row.uid]: ""}));
                                                            }
                                                            setTimeout(() => {
                                                                setValueDropdownOpen((prev) => ({...prev, [row.uid]: false}));
                                                            }, 200);
                                                        }}
                                                        className="flex-1 min-w-[60px] h-6 px-1 text-xs border-none outline-none bg-transparent dark:text-white"
                                                    />
                                                </div>

                                                {valueDropdownOpen[row.uid] && row.title && availableVals.length > 0 && (
                                                    <div className="absolute z-50 mt-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-36 overflow-y-auto" style={{width: "auto", minWidth: "160px"}}>
                                                        {availableVals.map((ov) => (
                                                            <button
                                                                key={ov.id}
                                                                type="button"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => {
                                                                    handleAddOptionValue(row.uid, ov.name);
                                                                    setValueDropdownOpen((prev) => ({...prev, [row.uid]: false}));
                                                                }}
                                                                className="flex items-center w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-left"
                                                            >
                                                                {ov.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteOption(row.uid)}
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

                            <div className="ml-9">
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    disabled={variantOptions.length >= 3 || loading}
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

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">
                                Associate Images with Variant
                                {assetIds.length > 0 && (
                                    <span className="ml-2 text-xs text-brand-600 dark:text-brand-400 font-normal">
                                        ({assetIds.length} selected)
                                    </span>
                                )}
                            </label>
                            {groupedAssets.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setIsAssetModalOpen(true)}
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
                                    {groupedAssets.map((asset) => (
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
                                                onClick={() => toggleAsset(asset.id)}
                                                disabled={loading}
                                                title="Remove image"
                                                className="absolute top-0.5 right-0.5 p-0.5 bg-white dark:bg-gray-850 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer z-10"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setIsAssetModalOpen(true)}
                                        disabled={loading}
                                        className="flex items-center justify-center w-12 h-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-750 bg-gray-50 dark:bg-gray-900/30 hover:border-brand-500 hover:bg-brand-50 dark:hover:border-brand-500/10 cursor-pointer transition-all"
                                        title="Manage Images"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-brand-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push(`/product/${productId}/variant/${variantId}`)}
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
                selectedIds={assetIds}
                onSelect={setAssetIds}
                assets={assets}
                onAssetUploaded={handleAssetUploaded}
            />
        </div>
    );
}
