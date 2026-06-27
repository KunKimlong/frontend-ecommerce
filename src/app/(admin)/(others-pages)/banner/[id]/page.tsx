"use client";

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {BannerData} from "@/type/Banner";
import {BannerService} from "@/service/banner.service";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";

const toMediaUrl = (uuid?: string) => {
    if (!uuid) return null;
    return `/media/image/${uuid}`;
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });
};

export default function BannerViewPage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();
    const [banner, setBanner] = useState<BannerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        BannerService.getById(Number(id))
            .then(setBanner)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div>
                <PageBreadcrumb pageTitle="View Banner"/>
                <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!banner) {
        return (
            <div>
                <PageBreadcrumb pageTitle="View Banner"/>
                <div className="flex items-center justify-center h-64 text-gray-500">Banner not found</div>
            </div>
        );
    }

    const displayUrl = toMediaUrl(banner.asset?.uuid);

    return (
        <div>
            <PageBreadcrumb pageTitle={banner.label}/>
            <div className="space-y-6">
                <div className="flex justify-end gap-3">
                    <Button size="sm" variant="outline" onClick={() => router.push("/banner")}>
                        Back to List
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => router.push(`/banner/${banner.id}/edit`)}>
                        Edit Banner
                    </Button>
                </div>

                <ComponentCard title="Banner Preview">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]">
                        {displayUrl ? (
                            <div className="relative w-full bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={displayUrl}
                                    alt={banner.label}
                                    className="w-full object-cover"
                                    style={{maxHeight: 360}}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 text-gray-400">
                                No image
                            </div>
                        )}

                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {banner.headerLabel}
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                                        {banner.label}
                                    </p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                    {banner.type}
                                </span>
                            </div>

                            {banner.description && (
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {banner.description}
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/[0.08]">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Button</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {banner.buttonName || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {banner.product?.name || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Order / Level</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {banner.order != null ? `Level ${banner.order}` : "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDate(banner.startAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDate(banner.endAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/[0.08]">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Created by {banner.createdBy?.firstName} {banner.createdBy?.lastName}
                                    {banner.updatedBy && ` · Updated by ${banner.updatedBy.firstName} ${banner.updatedBy.lastName}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
