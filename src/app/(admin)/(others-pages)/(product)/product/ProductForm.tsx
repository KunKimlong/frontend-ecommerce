"use client";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {CategoryService} from "@/service/category.service";
import {ColorService} from "@/service/color.service";
import {ProductService} from "@/service/product.service";
import {AssetService} from "@/service/asset.service";
import {CategoryData} from "@/type/Category";
import {ColorData} from "@/type/Color";
import {AssetData} from "@/type/Asset";
import {ProductData} from "@/type/Product";

interface ProductFormProps {
    product?: ProductData;
}

export default function ProductForm({product}: ProductFormProps) {
    const router = useRouter();
    const isEdit = !!product;

    const [name, setName] = useState(product?.name ?? "");
    const [description, setDescription] = useState(product?.description ?? "");
    const [importPrice, setImportPrice] = useState<number | "">(product?.importPrice ?? "");
    const [salePrice, setSalePrice] = useState<number | "">(product?.salePrice ?? "");
    const [stockQty, setStockQty] = useState<number | "">(product?.stockQty ?? "");
    const [categoryId, setCategoryId] = useState<number | "">(product?.category?.id ?? "");
    const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
    const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

    useEffect(() => {
        if (product) {
            console.log(product);
            console.log(product.colors);
            setSelectedColorIds(product.colors?.map((c) => c.id) ?? []);
            setSelectedAssetIds(product.assets?.map((a) => a.id) ?? []);
        }
    }, [product]);

    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [colors, setColors] = useState<ColorData[]>([]);
    const [assets, setAssets] = useState<AssetData[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [catRes, colorRes, assetRes] = await Promise.all([
                    CategoryService.getAll(0, 100),
                    ColorService.getAll(0, 100),
                    AssetService.getAll(0, 100),
                ]);
                setCategories(catRes.categoryData ?? catRes);
                setColors(colorRes.colorData ?? colorRes);
                setAssets(assetRes.assetData ?? assetRes);
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchOptions();
    }, []);

    const toggleColor = (id: number) =>
        setSelectedColorIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

    const toggleAsset = (id: number) =>
        setSelectedAssetIds((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Product name is required");
            return;
        }
        if (importPrice === "" || importPrice < 0) {
            setError("Import price is required and must be non-negative");
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
        if (categoryId === "") {
            setError("Category is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                name,
                description,
                importPrice: Number(importPrice),
                salePrice: Number(salePrice),
                stockQty: Number(stockQty),
                categoryId: Number(categoryId),
                colorIds: selectedColorIds,
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="import-price" className={labelClass}>Import Price</label>
                                <input
                                    id="import-price"
                                    type="number"
                                    min={0}
                                    placeholder="0.00"
                                    value={importPrice}
                                    onChange={(e) => setImportPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="sale-price" className={labelClass}>Sale Price</label>
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="stock-qty" className={labelClass}>Stock Quantity</label>
                                <input
                                    id="stock-qty"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={stockQty}
                                    onChange={(e) => setStockQty(e.target.value === "" ? "" : Number(e.target.value))}
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

                        <div>
                            <label className={labelClass}>Colors</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {colors.map((color) => {
                                    const selected = selectedColorIds.includes(color.id);
                                    return (
                                        <button
                                            key={color.id}
                                            type="button"
                                            onClick={() => toggleColor(color.id)}
                                            disabled={loading}
                                            title={color.name}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                                selected
                                                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                                                    : "border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
                                            }`}
                                        >
                                            <span
                                                className="inline-block w-3 h-3 rounded-full border border-white/20"
                                                style={{backgroundColor: color.code}}
                                            />
                                            {color.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                Images
                                {selectedAssetIds.length > 0 && (
                                    <span className="ml-2 text-xs text-brand-600 dark:text-brand-400 font-normal">
                                        {selectedAssetIds.length} selected
                                    </span>
                                )}
                            </label>
                            {assets.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No assets available</p>
                            ) : (
                                <div className="mt-1 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                                    {assets.map((asset) => {
                                        const selected = selectedAssetIds.includes(asset.id);
                                        return (
                                            <button
                                                key={asset.id}
                                                type="button"
                                                onClick={() => toggleAsset(asset.id)}
                                                disabled={loading}
                                                title={asset.name}
                                                className={`relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                                                    selected
                                                        ? "border-brand-500 ring-2 ring-brand-500/30"
                                                        : "border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                                                }`}
                                            >
                                                <img
                                                    src={"/media" + asset.path}
                                                    alt={asset.name}
                                                    className="w-full h-[72px] object-cover"
                                                />
                                                {selected && (
                                                    <div className="absolute top-1 right-1">
                                                        <div className="bg-brand-500 rounded-full p-0.5 shadow">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                                 fill="currentColor" className="w-3 h-3 text-white">
                                                                <path fillRule="evenodd"
                                                                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                                                                      clipRule="evenodd"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-1 py-0.5 text-left bg-white dark:bg-gray-900">
                                                    {asset.name}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
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
        </div>
    );
}