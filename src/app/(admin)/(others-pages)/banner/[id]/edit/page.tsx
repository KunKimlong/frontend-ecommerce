"use client"
import React, {useEffect, useState} from "react";
import {BannerService} from "@/service/banner.service";
import BannerForm from "@/app/(admin)/(others-pages)/banner/BannerForm";
import {useParams} from "next/navigation";
import {BannerData} from "@/type/Banner";

export default function BannerEditPage() {
    const {id} = useParams<{id: string}>();
    const [loading, setLoading] = useState(true);
    const [banner, setBanner] = useState<BannerData | undefined>(undefined);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await BannerService.getById(Number(id));
                setBanner(data);
            } catch (err) {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">Loading product...</p>
            </div>
        );
    }

    if (error || !banner) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error || "Product not found"}</p>
            </div>
        );
    }
    return <BannerForm banner={banner}/>;
}