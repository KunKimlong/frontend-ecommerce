"use client";

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {StoreData} from "@/type/Store";
import {StoreService} from "@/service/store.service";

const STORE_LOGO_REFRESH_EVENT = "store-logo-updated";
const STORE_LOGO_CACHE_KEY = "app_store_logo";

interface StoreLogoState {
    logoUrl: string | null;
    storeName: string | null;
    loading: boolean;
}

interface StoreLogoContextType extends StoreLogoState {
    refresh: () => void;
}

const StoreLogoContext = createContext<StoreLogoContextType | null>(null);

const toMediaLogoUrl = (logoPath?: string | null) => {
    if (!logoPath) return null;
    return `/media${logoPath.replace(/^\/api\/asset/, "")}`;
};

const pickStoreWithLogo = (stores: StoreData[]) => {
    const activeWithLogo = stores.find((item) => item.isActive && item.logoPath);
    if (activeWithLogo) return activeWithLogo;
    return stores.find((item) => item.logoPath) ?? null;
};

const loadFromCache = (): StoreLogoState | null => {
    try {
        const cached = sessionStorage.getItem(STORE_LOGO_CACHE_KEY);
        if (cached) return JSON.parse(cached);
    } catch {}
    return null;
};

const saveToCache = (state: StoreLogoState) => {
    try {
        sessionStorage.setItem(STORE_LOGO_CACHE_KEY, JSON.stringify(state));
    } catch {}
};

export function StoreLogoProvider({children}: { children: React.ReactNode }) {
    const [state, setState] = useState<StoreLogoState>({logoUrl: null, storeName: null, loading: true});
    const isMounted = useRef(true);

    const fetchStoreLogo = useCallback(async () => {
        try {
            const res = await StoreService.getAll(0, 20, {
                sortBy: "id",
                ascending: false,
            });
            if (!isMounted.current) return;

            const selectedStore = pickStoreWithLogo(res.data ?? []);
            const newState = {
                logoUrl: toMediaLogoUrl(selectedStore?.logoPath),
                storeName: selectedStore?.name ?? null,
                loading: false,
            };
            setState(newState);
            saveToCache(newState);
        } catch {
            if (isMounted.current) {
                setState({logoUrl: null, storeName: null, loading: false});
            }
        }
    }, []);

    useEffect(() => {
        const cached = loadFromCache();
        if (cached) {
            setState({...cached, loading: false});
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        fetchStoreLogo();

        const handleRefresh = () => fetchStoreLogo();
        if (typeof window !== "undefined") {
            window.addEventListener(STORE_LOGO_REFRESH_EVENT, handleRefresh);
        }

        return () => {
            isMounted.current = false;
            if (typeof window !== "undefined") {
                window.removeEventListener(STORE_LOGO_REFRESH_EVENT, handleRefresh);
            }
        };
    }, [fetchStoreLogo]);

    return (
        <StoreLogoContext.Provider value={{...state, refresh: fetchStoreLogo}}>
            {children}
        </StoreLogoContext.Provider>
    );
}

export function useStoreLogo(): StoreLogoState & { refresh: () => void } {
    const ctx = useContext(StoreLogoContext);
    if (!ctx) {
        throw new Error("useStoreLogo must be used within <StoreLogoProvider>");
    }
    return ctx;
}

export {STORE_LOGO_REFRESH_EVENT};
