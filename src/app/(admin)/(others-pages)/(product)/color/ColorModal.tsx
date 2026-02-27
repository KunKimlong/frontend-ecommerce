import React, {useEffect, useState} from "react";
import {Modal} from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {ColorService} from "@/service/color.service";
import {ActionTypes} from "@/constant/actionType";
import {ColorData, ColorRequest} from "@/type/Color";
import {DefaultModal} from "@/components/ui/modal/DefaultModal";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    action: ActionTypes;
    color?: ColorData;
    onSuccess: (action: ActionTypes, payload: ColorData | number) => void;
}

export default function ColorModal({
                                       isOpen,
                                       closeModal,
                                       action,
                                       color,
                                       onSuccess,
                                   }: ModalProps) {
    const COLOR_REQUIRED = "color name is required";
    const CODE_REQUIRED = "Code is required";
    const CODE_NOT_VALID = "Code is not valid";

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (color) {
            setName(color.name);
            setCode(color.code);
        }
    }, [color]);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setCode("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (action !== ActionTypes.DELETE && !name.trim()) {
            setError(COLOR_REQUIRED);
            return;
        }

        setLoading(true);
        setError("");

        try {
            switch (action) {
                case ActionTypes.CREATE: {
                    let colorRequest: ColorRequest = {name, code};
                    if (!isValidHex(colorRequest.code)) {
                        setError(CODE_NOT_VALID)
                        return;
                    }
                    const created = await ColorService.save(colorRequest);
                    onSuccess(ActionTypes.CREATE, created);
                    break;
                }

                case ActionTypes.UPDATE: {
                    if (!color) {
                        return;
                    }
                    let colorRequest: ColorRequest = {name, code};
                    if (!isValidHex(colorRequest.code)) {
                        setError(CODE_NOT_VALID);
                        return;
                    }
                    const updated = await ColorService.update(color.id, colorRequest);
                    onSuccess(ActionTypes.UPDATE, updated);
                    break;
                }

                case ActionTypes.DELETE: {
                    if (!color) return;
                    await ColorService.delete(color.id);
                    onSuccess(ActionTypes.DELETE, color.id);
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
    const isValidHex = (value: string) => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
    };
    const handleChangeCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const cursorPos = input.selectionStart ?? 0;

        let value = input.value.toUpperCase().trim();

        if (!value.startsWith("#")) {
            value = "#" + value;
        }

        setCode(value);

        requestAnimationFrame(() => {
            const pos =
                value.startsWith("#") && cursorPos === 0
                    ? 1
                    : cursorPos;

            input.setSelectionRange(pos, pos);
        });
    };


    return (
        <DefaultModal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[700px] p-6 lg:p-10 modal"
            header={
                <>
                    {action === ActionTypes.CREATE && <span>Add Color</span>}
                    {action === ActionTypes.UPDATE && <span>Update Color</span>}
                    {action === ActionTypes.DELETE && <span>Delete Color</span>}
                </>
            }
            body={
                <>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {action !== ActionTypes.DELETE && (
                        <div className="flex flex-wrap">
                            <div className="w-1/2">
                                <div className="modal-form-group">
                                    <label
                                        htmlFor="color-name"
                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                    >
                                        Color Name
                                    </label>
                                    <input
                                        id="color-name"
                                        type="text"
                                        placeholder="Enter color name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    />
                                </div>
                            </div>
                            <div className="w-1/2">
                                <div className="modal-form-group">
                                    <label
                                        htmlFor="color-code"
                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                    >
                                        Color Code
                                    </label>
                                    <input
                                        id="color-code"
                                        type="text"
                                        placeholder="Enter color name"
                                        value={code}
                                        maxLength={7}
                                        onChange={handleChangeCode}
                                        disabled={loading}
                                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {action === ActionTypes.DELETE && (
                        <p className="mb-1.5 block font-medium modal-title text-gray-700 dark:text-gray-400">
                            Are you sure you want to remove this?
                        </p>

                    )}
                </>
            }

            footer={
                <>
                    <div className="flex items-center gap-3 mt-4 modal-footer sm:justify-end">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading
                                ? action === ActionTypes.DELETE
                                    ? "Deleting..."
                                    : action === ActionTypes.UPDATE
                                        ? "Updating..."
                                        : "Saving..."
                                : action === ActionTypes.DELETE
                                    ? "Delete"
                                    : action === ActionTypes.UPDATE
                                        ? "Update"
                                        : "+ Color"}
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
                </>
            }
        />
    );
}
