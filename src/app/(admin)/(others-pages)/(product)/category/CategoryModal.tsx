import React, {useState} from "react";
import {Modal} from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {CategoryService} from "@/service/category.service";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

export default function CategoryModal({
                                          isOpen,
                                          closeModal,
                                      }: ModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Category name is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            console.log('📤 Creating category:', { name });
            console.log('🍪 Current cookies:', document.cookie);

            const res = await CategoryService.save({ name: name });

            console.log('✅ Category created:', res);

            setName("");
            closeModal();
        } catch (error: any) {
            console.error('❌ Error saving category:', error);
            setError(error.message || "Failed to save category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] p-6 lg:p-10"
        >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        Add Category
                    </h5>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="mt-8">
                    <div className="flex flex-wrap">
                        <div className="w-full">
                            <label
                                htmlFor="category-name"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                            >
                                Category Name
                            </label>
                            <input
                                id="category-name"
                                type="text"
                                placeholder="Enter category name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : '+ Category'}
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
            </div>
        </Modal>
    );
}