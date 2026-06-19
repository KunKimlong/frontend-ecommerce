"use client";
import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import {ProductService} from "@/service/product.service";
import {ProductData} from "@/type/Product";

export default function ProductDetailPage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();

    const [product, setProduct] = useState<ProductData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data: ProductData = await ProductService.getById(Number(id));
                setProduct(data);
                if (data.assets?.length) {
                    setSelectedImage("/media/image/" + data.assets[0].uuid);
                }
                setSelectedVariantId(data.variants?.[0]?.id ?? null);
            } catch (err) {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(value);

    const getAssetUrl = (asset: ProductData["assets"][number]) =>
        asset.uuid ? "/media/image/" + asset.uuid : "/media" + asset.path;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading product...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "Product not found"}</p>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Product Detail"/>
            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/product")}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                             className="w-4 h-4">
                            <path fillRule="evenodd"
                                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                                  clipRule="evenodd"/>
                        </svg>
                        Back to Products
                    </button>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => router.push(`/product/${product.id}/edit`)}
                    >
                        Edit Product
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <ComponentCard>
                        <div className="p-4 space-y-3">
                            <div
                                className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                         className="w-16 h-16 text-gray-300 dark:text-gray-600">
                                        <path fillRule="evenodd"
                                              d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                                              clipRule="evenodd"/>
                                    </svg>
                                )}
                            </div>

                            {product.assets && product.assets.length > 1 && (
                                <div className="grid grid-cols-5 gap-2">
                                    {product.assets.map((asset) => (
                                        <button
                                            key={asset.id}
                                            onClick={() => setSelectedImage("/media/image/" + asset.uuid)}
                                            className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                                                selectedImage === "/media/image/" + asset.uuid
                                                    ? "border-brand-500 ring-2 ring-brand-500/30"
                                                    : "border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
                                            }`}
                                        >
                                            <img
                                                src={"/media/image/" + asset.uuid}
                                                alt={asset.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ComponentCard>

                    <div className="space-y-4">

                        <ComponentCard>
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {product.name}
                                    </h1>
                                    {product.category && (
                                        <span
                                            className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                            {product.category.name}
                                        </span>
                                    )}
                                </div>
                                {product.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                        </ComponentCard>

                        <ComponentCard>
                            <div className="p-5">
                                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    Base Sale Price
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] p-3 text-center col-span-2">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Base Sale Price</p>
                                        <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
                                            {formatPrice(product.salePrice)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ComponentCard>

                        {(() => {
                            const totalStock = product.variants?.reduce((sum, v) => sum + v.stockQty, 0) ?? 0;
                            return (
                                <ComponentCard>
                                    <div className="p-5">
                                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                            Total Stock
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-3xl font-bold ${
                                                totalStock === 0
                                                    ? "text-red-500"
                                                    : totalStock < 10
                                                        ? "text-yellow-500"
                                                        : "text-green-500"
                                            }`}>
                                                {totalStock}
                                            </span>
                                            <span className="text-sm text-gray-400 dark:text-gray-500">units available</span>
                                            <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-medium ${
                                                totalStock === 0
                                                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                                    : totalStock < 10
                                                        ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                        : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                            }`}>
                                                {totalStock === 0 ? "Out of Stock" : totalStock < 10 ? "Low Stock" : "In Stock"}
                                            </span>
                                        </div>
                                    </div>
                                </ComponentCard>
                            );
                        })()}

                        {product.variants && product.variants.length > 0 && (
                            <ComponentCard>
                                <div className="p-5 space-y-4">
                                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Product Variants
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                                <tr>
                                                    <th className="px-3 py-2">Variant Name</th>
                                                    <th className="px-3 py-2">Attributes</th>
                                                    <th className="px-3 py-2">Price</th>
                                                    <th className="px-3 py-2">Sale Price</th>
                                                    <th className="px-3 py-2">Stock</th>
                                                    <th className="px-3 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {product.variants.map((v) => (
                                                    <tr
                                                        key={v.id}
                                                        onClick={() => setSelectedVariantId(v.id)}
                                                        className={`bg-white dark:bg-transparent cursor-pointer transition-colors ${
                                                            selectedVariantId === v.id
                                                                ? "bg-brand-50/70 dark:bg-brand-900/20"
                                                                : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                                                        }`}
                                                    >
                                                        <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">
                                                            <div className="flex items-center gap-2">
                                                                {v.assets && v.assets.length > 0 ? (
                                                                    <img
                                                                        src={getAssetUrl(v.assets[0])}
                                                                        alt={v.name}
                                                                        className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">
                                                                        No Image
                                                                    </div>
                                                                )}
                                                                <span>{v.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {v.optionValues?.map((val) => (
                                                                    <span
                                                                        key={val.id}
                                                                        className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                                        title={val.option.name}
                                                                    >
                                                                        {val.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3">{formatPrice(v.price)}</td>
                                                        <td className="px-3 py-3 font-semibold text-brand-600 dark:text-brand-400">{formatPrice(v.salePrice)}</td>
                                                        <td className="px-3 py-3 font-medium">{v.stockQty}</td>
                                                        <td className="px-3 py-3">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/product/${product.id}/variant/${v.id}`);
                                                                }}
                                                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors whitespace-nowrap"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </ComponentCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
