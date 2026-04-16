"use client";
import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {AssetService} from "@/service/asset.service";
import {ProductService} from "@/service/product.service";
import {BannerService} from "@/service/banner.service";
import {AssetData} from "@/type/Asset";
import {ProductData} from "@/type/Product";
import {BannerData, BannerType} from "@/type/Banner";
import DatePicker from "@/components/form/date-picker";

interface BannerFormProps {
    banner?: BannerData;
}


export default function BannerForm({banner}: BannerFormProps) {
    const router = useRouter();
    const isEdit = !!banner;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Form fields
    const [label, setLabel] = useState(banner?.label ?? "");
    const [headerLabel, setHeaderLabel] = useState(banner?.headerLabel ?? "");
    const [bannerTypeId, setBannerTypeId] = useState<number | string>(banner?.bannerType?.id ?? "");
    const [description, setDescription] = useState(banner?.description ?? "");
    const [buttonName, setButtonName] = useState(banner?.buttonName ?? "");
    const [startAt, setStartAt] = useState(banner?.startAt?.slice(0, 10) ?? "");
    const [endAt, setEndAt] = useState(banner?.endAt?.slice(0, 10) ?? "");
    const [selectedProductId, setSelectedProductId] = useState<number | null>(banner?.product?.id ?? null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        banner?.asset?.uuid ? `/media/image/${banner.asset.uuid}` : null
    );

    // Data
    const [bannerTypes, setBannerTypes] = useState<BannerType[]>([]);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [productSearch, setProductSearch] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [productRes, typesRes] = await Promise.all([
                    ProductService.getAll(0, 100),
                    BannerService.getTypes(),
                ]);
                setProducts(productRes.data ?? productRes);

                // Handle both simple string array and object array and make sure it's an array
                const typesData = (typesRes as any).data || typesRes;
                let types = Array.isArray(typesData) ? typesData : [];

                // If the response is an array of strings, convert to BannerType objects for consistency
                if (types.length > 0 && typeof types[0] === 'string') {
                    types = types.map((name: string, index: number) => ({id: index, name}));
                }

                setBannerTypes(types);
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchOptions();
    }, []);

    const selectedProduct = useMemo(() =>
            products.find((p) => p.id === selectedProductId) ?? null,
        [products, selectedProductId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const filteredProducts = useMemo(() =>
            products.filter((p) =>
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.category?.name ?? "").toLowerCase().includes(productSearch.toLowerCase())
            ),
        [products, productSearch]);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(value);

    const handleSubmit = async () => {
        if (!label.trim()) {
            setError("Label is required");
            return;
        }
        if (!headerLabel.trim()) {
            setError("Header label is required");
            return;
        }
        if (!bannerTypeId) {
            setError("Type is required");
            return;
        }
        if (!startAt) {
            setError("Start date is required");
            return;
        }
        if (!endAt) {
            setError("End date is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                label,
                headerLabel,
                bannerTypeId: Number(bannerTypeId),
                description,
                buttonName,
                productId: selectedProductId,
                assetId: null, // assetId is handled via file upload on backend
                startAt,
                endAt,
            };

            if (isEdit && banner) {
                await BannerService.update(banner.id, payload as any, selectedFile ?? undefined);
            } else {
                await BannerService.save(payload as any, selectedFile ?? undefined);
            }

            router.push("/banner");
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
            <PageBreadcrumb pageTitle={isEdit ? "Edit Banner" : "Add Banner"}/>
            <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">

                    {/* ── Left: Banner form ── */}
                    <div className="space-y-6">
                        <ComponentCard>
                            <div className="p-6 lg:p-8 space-y-5">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="banner-label" className={labelClass}>Label</label>
                                        <input
                                            id="banner-label"
                                            type="text"
                                            placeholder="e.g. Summer Sale"
                                            value={label}
                                            onChange={(e) => {
                                                setLabel(e.target.value);
                                                if (error) setError("");
                                            }}
                                            disabled={loading}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="banner-header" className={labelClass}>Header Label</label>
                                        <input
                                            id="banner-header"
                                            type="text"
                                            placeholder="e.g. New Season Collection"
                                            value={headerLabel}
                                            onChange={(e) => {
                                                setHeaderLabel(e.target.value);
                                                if (error) setError("");
                                            }}
                                            disabled={loading}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="banner-type" className={labelClass}>Type</label>
                                        <select
                                            id="banner-type"
                                            value={bannerTypeId}
                                            onChange={(e) => {
                                                setBannerTypeId(e.target.value);
                                                if (error) setError("");
                                            }}
                                            disabled={loading}
                                            className={inputClass}
                                        >
                                            <option value="">Select type</option>
                                            {bannerTypes.map((t: BannerType) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name.replace("_", " ")}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="banner-button" className={labelClass}>Button Name</label>
                                        <input
                                            id="banner-button"
                                            type="text"
                                            placeholder="e.g. Shop Now"
                                            value={buttonName}
                                            onChange={(e) => setButtonName(e.target.value)}
                                            disabled={loading}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="banner-description" className={labelClass}>Description</label>
                                    <textarea
                                        id="banner-description"
                                        placeholder="Enter banner description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={loading}
                                        rows={3}
                                        className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <DatePicker
                                            id="start-date"
                                            label="Start Date"
                                            placeholder="Select date"
                                            defaultDate={startAt}
                                            disabled={loading}
                                            onChange={(_, dateStr) => {
                                                setStartAt(dateStr);
                                                if (error) setError("");
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <DatePicker
                                            id="end-date"
                                            label="End Date"
                                            placeholder="Select date"
                                            defaultDate={endAt}
                                            disabled={loading}
                                            onChange={(_, dateStr) => {
                                                setEndAt(dateStr);
                                                if (error) setError("");
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ComponentCard>

                        {/* ── Image upload ── */}
                        <ComponentCard>
                            <div className="p-6 lg:p-8">
                                <label className={labelClass}>Banner Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-full h-44 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Banner preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                                <p className="mt-2 text-xs text-gray-400">No image selected</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            disabled={loading}
                                            className="hidden"
                                            id="banner-image-upload"
                                        />
                                        <label
                                            htmlFor="banner-image-upload"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
                                        >
                                            Choose Image
                                        </label>
                                        {previewUrl && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ComponentCard>

                        {/* ── Product picker ── */}
                        <ComponentCard>
                            <div className="p-6 lg:p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <label className={`${labelClass} mb-0`}>Featured Product</label>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Select one</span>
                                </div>

                                {/* Search */}
                                <div className="relative mb-3">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 20 20">
                                            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                                            <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5"
                                                  strokeLinecap="round"/>
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search products…"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent pl-9 pr-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    />
                                </div>

                                {/* List */}
                                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                                    {filteredProducts.length === 0 ? (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No
                                            products found</p>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const isSelected = selectedProductId === product.id;
                                            return (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => setSelectedProductId(isSelected ? null : product.id)}
                                                    disabled={loading}
                                                    className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border transition-all ${isSelected
                                                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-500"
                                                        : "border-gray-200 hover:border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600"
                                                    }`}
                                                >
                                                    {/* Product image / placeholder */}
                                                    <div
                                                        className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                                        {product.assets && product.assets.length > 0 ? (
                                                            <img
                                                                src={"/media/image/" + product.assets[0].uuid}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <svg className="w-5 h-5 text-gray-400" fill="none"
                                                                 viewBox="0 0 24 24">
                                                                <rect x="3" y="3" width="18" height="18" rx="3"
                                                                      stroke="currentColor" strokeWidth="1.5"/>
                                                                <path d="M3 9h18" stroke="currentColor"
                                                                      strokeWidth="1.5"/>
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${isSelected ? "text-brand-700 dark:text-brand-300" : "text-gray-800 dark:text-gray-200"}`}>
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {product.category?.name ?? "—"} · Stock: {product.stockQty}
                                                        </p>
                                                    </div>

                                                    {/* Price */}
                                                    <span
                                                        className={`text-sm font-semibold flex-shrink-0 ${isSelected ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"}`}>
                                                        {formatPrice(product.salePrice)}
                                                    </span>

                                                    {/* Radio dot */}
                                                    <span
                                                        className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-brand-500" : "border-gray-300 dark:border-gray-600"
                                                        }`}>
                                                        {isSelected && (
                                                            <span className="w-2 h-2 rounded-full bg-brand-500 block"/>
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </ComponentCard>

                        {/* ── Actions ── */}
                        <div className="flex items-center gap-3 pt-2">
                            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading
                                    ? isEdit ? "Updating..." : "Saving..."
                                    : isEdit ? "Update Banner" : "+ Add Banner"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push("/banner")}
                                disabled={loading}
                                className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* ── Right: Selected product preview ── */}
                    <div className="sticky top-6">
                        <ComponentCard>
                            <div className="p-5">
                                <p className={`${labelClass} mb-4`}>Selected Product</p>

                                {!selectedProductId || !selectedProduct ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div
                                            className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                            {selectedProductId && !selectedProduct ? (
                                                <svg className="w-6 h-6 text-brand-500 animate-spin" fill="none"
                                                     viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                    <rect x="3" y="3" width="18" height="18" rx="3"
                                                          stroke="currentColor"
                                                          strokeWidth="1.5"/>
                                                    <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.5"/>
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {selectedProductId && !selectedProduct ? "Searching product…" : "No product selected"}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {selectedProductId && !selectedProduct ? "Please wait a moment" : "Pick a product from the list"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Product image */}
                                        <div
                                            className="w-full h-44 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                            {selectedProduct.assets && selectedProduct.assets.length > 0 ? (
                                                <img
                                                    src={"/media/image/" + selectedProduct.assets[0].uuid}
                                                    alt={selectedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none"
                                                     viewBox="0 0 24 24">
                                                    <rect x="3" y="3" width="18" height="18" rx="3"
                                                          stroke="currentColor" strokeWidth="1.2"/>
                                                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.2"/>
                                                </svg>
                                            )}
                                        </div>

                                        {/* Name & category */}
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                                                {selectedProduct.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {selectedProduct.category?.name ?? "—"}
                                            </p>
                                        </div>

                                        {/* Price row */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                                                {formatPrice(selectedProduct.salePrice)}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedProduct.stockQty > 0
                                                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                {selectedProduct.stockQty > 0 ? `In stock · ${selectedProduct.stockQty}` : "Out of stock"}
                                            </span>
                                        </div>

                                        {/* Detail rows */}
                                        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Import price</span>
                                                <span
                                                    className="font-medium text-gray-700 dark:text-gray-300">{formatPrice(selectedProduct.importPrice)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Stock qty</span>
                                                <span
                                                    className="font-medium text-gray-700 dark:text-gray-300">{selectedProduct.stockQty}</span>
                                            </div>
                                            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Colors</span>
                                                    <div className="flex items-center gap-1">
                                                        {selectedProduct.colors.map((color) => (
                                                            <span
                                                                key={color.id}
                                                                title={color.name}
                                                                className="inline-block w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                                                style={{backgroundColor: color.code}}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {selectedProduct.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3 line-clamp-3">
                                                {selectedProduct.description}
                                            </p>
                                        )}

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProductId(null)}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-transparent px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                                                <path d="M4 10h12" stroke="currentColor" strokeWidth="1.5"
                                                      strokeLinecap="round"/>
                                            </svg>
                                            Remove product
                                        </button>
                                    </div>
                                )}
                            </div>
                        </ComponentCard>
                    </div>
                </div>
            </div>
        </div>
    );
}