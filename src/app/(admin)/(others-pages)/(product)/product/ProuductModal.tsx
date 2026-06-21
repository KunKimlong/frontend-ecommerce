"use client";

import React, {useEffect, useState} from "react";
import Button from "@/components/ui/button/Button";
import {ActionTypes} from "@/constant/actionType";
import {ProductData} from "@/type/Product";
import {DefaultModal} from "@/components/ui/modal/DefaultModal";
import {ProductService} from "@/service/product.service";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    action: ActionTypes;
    product?: ProductData;
    onSuccess: (action: ActionTypes, payload: ProductData | number) => void;
}

export default function ProductModal({
                                         isOpen,
                                         closeModal,
                                         action,
                                         product,
                                         onSuccess,
                                     }: ModalProps) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        if (!isOpen) {
            setError("");
        }
    }, [isOpen]);


    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            switch (action) {
                case ActionTypes.DELETE: {
                    if (!product) return;
                    await ProductService.delete(product.id);
                    onSuccess(ActionTypes.DELETE, product.id);
                    break;
                }
            }

            closeModal();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultModal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] p-6 lg:p-10 modal"
            header={
                <>
                    {action === ActionTypes.DELETE && <span>Delete Product</span>}
                </>
            }
            body={
                <>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {action === ActionTypes.DELETE && (
                        <p className="mb-1.5 block font-medium modal-title text-gray-700 dark:text-gray-400">
                            Are you sure you want to remove this product?
                        </p>
                    )}
                </>
            }
            footer={
                <div className="flex items-center gap-3 mt-4 modal-footer sm:justify-end">
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>

                    <button
                        onClick={closeModal}
                        type="button"
                        disabled={loading}
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto disabled:opacity-50"
                    >
                        Close
                    </button>
                </div>
            }
        />
    );
}
