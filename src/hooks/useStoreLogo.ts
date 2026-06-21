"use client";

import {useEffect, useState} from "react";
import {StoreData} from "@/type/Store";
import {StoreService} from "@/service/store.service";

export const STORE_LOGO_REFRESH_EVENT = "store-logo-updated";

interface StoreLogoState {
    logoUrl: string | null;
    storeName: string | null;
}

const toMediaLogoUrl = (logoPath?: string | null) => {
    if (!logoPath) return null;
    return `/media${logoPath.replace(/^\/api\/asset/, "")}`;
};

const pickStoreWithLogo = (stores: StoreData[]) => {
    const activeWithLogo = stores.find((item) => item.isActive && item.logoPath);
    if (activeWithLogo) return activeWithLogo;
    return stores.find((item) => item.logoPath) ?? null;
};

export const useStoreLogo = (): StoreLogoState => {
    const [state, setState] = useState<StoreLogoState>({
        logoUrl: null,
        storeName: null,
    });

    useEffect(() => {
        let isMounted = true;

        const loadStoreLogo = async () => {
            try {
                const res = await StoreService.getAll(0, 20, {
                    sortBy: "id",
                    ascending: false,
                });

                if (!isMounted) return;

                const selectedStore = pickStoreWithLogo(res.data ?? []);
                setState({
                    logoUrl: toMediaLogoUrl(selectedStore?.logoPath),
                    storeName: selectedStore?.name ?? null,
                });
            } catch (error) {
                if (isMounted) {
                    setState({logoUrl: null, storeName: null});
                }
            }
        };

        loadStoreLogo();

        const handleRefreshLogo = () => {
            loadStoreLogo();
        };

        if (typeof window !== "undefined") {
            window.addEventListener(STORE_LOGO_REFRESH_EVENT, handleRefreshLogo);
        }

        return () => {
            isMounted = false;
            if (typeof window !== "undefined") {
                window.removeEventListener(STORE_LOGO_REFRESH_EVENT, handleRefreshLogo);
            }
        };
    }, []);

    return state;
};
