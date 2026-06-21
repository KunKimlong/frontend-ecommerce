import {useEffect, useState} from "react";
import Button from "@/components/ui/button/Button";
import {OptionService} from "@/service/option.service";
import {ActionTypes} from "@/constant/actionType";
import {OptionData, OptionValueData} from "@/type/Option";
import {DefaultModal} from "@/components/ui/modal/DefaultModal";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    action: ActionTypes;
    targetType: "option" | "value";
    option?: OptionData;
    optionValue?: OptionValueData;
    optionsList?: OptionData[]; // for selecting parent option in option value CRUD
    onSuccess: (action: ActionTypes, payload: any) => void;
}

export default function OptionModal({
                                       isOpen,
                                       closeModal,
                                       action,
                                       targetType,
                                       option,
                                       optionValue,
                                       optionsList = [],
                                       onSuccess,
                                   }: ModalProps) {

    const [name, setName] = useState("");
    const [selectedOptionId, setSelectedOptionId] = useState<number | "">("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (targetType === "option" && option) {
            setName(option.name);
        } else if (targetType === "value" && optionValue) {
            setName(optionValue.name);
            setSelectedOptionId(optionValue.option.id);
        }
    }, [option, optionValue, targetType]);

    useEffect(() => {
        if (!isOpen) {
            setName("");
            setSelectedOptionId("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (action !== ActionTypes.DELETE && !name.trim()) {
            setError("Name is required");
            return;
        }

        if (action !== ActionTypes.DELETE && targetType === "value" && selectedOptionId === "") {
            setError("Option is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (targetType === "option") {
                switch (action) {
                    case ActionTypes.CREATE: {
                        const created = await OptionService.save({name});
                        onSuccess(ActionTypes.CREATE, created);
                        break;
                    }
                    case ActionTypes.UPDATE: {
                        if (!option) return;
                        const updated = await OptionService.update(option.id, {name});
                        onSuccess(ActionTypes.UPDATE, updated);
                        break;
                    }
                    case ActionTypes.DELETE: {
                        if (!option) return;
                        await OptionService.delete(option.id);
                        onSuccess(ActionTypes.DELETE, option.id);
                        break;
                    }
                }
            } else {
                switch (action) {
                    case ActionTypes.CREATE: {
                        const created = await OptionService.saveValue({
                            name,
                            optionId: Number(selectedOptionId)
                        });
                        onSuccess(ActionTypes.CREATE, created);
                        break;
                    }
                    case ActionTypes.UPDATE: {
                        if (!optionValue) return;
                        const updated = await OptionService.updateValue(optionValue.id, {
                            name,
                            optionId: Number(selectedOptionId)
                        });
                        onSuccess(ActionTypes.UPDATE, updated);
                        break;
                    }
                    case ActionTypes.DELETE: {
                        if (!optionValue) return;
                        await OptionService.deleteValue(optionValue.id);
                        onSuccess(ActionTypes.DELETE, optionValue.id);
                        break;
                    }
                }
            }

            closeModal();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const titleText = `${action === ActionTypes.CREATE ? "Add" : action === ActionTypes.UPDATE ? "Update" : "Delete"} ${
        targetType === "option" ? "Option" : "Option Value"
    }`;

    return (
        <DefaultModal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[600px] p-6 lg:p-10 modal"
            header={<span>{titleText}</span>}
            body={
                <>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {action !== ActionTypes.DELETE && (
                        <div className="space-y-4 mt-4">
                            {targetType === "value" && (
                                <div>
                                    <label
                                        htmlFor="parent-option"
                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                    >
                                        Option
                                    </label>
                                    <select
                                        id="parent-option"
                                        value={selectedOptionId}
                                        onChange={(e) => setSelectedOptionId(e.target.value === "" ? "" : Number(e.target.value))}
                                        disabled={loading}
                                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    >
                                        <option value="">Select Option</option>
                                        {optionsList.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="option-name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                                >
                                    {targetType === "option" ? "Option Name" : "Option Value Name"}
                                </label>
                                <input
                                    id="option-name"
                                    type="text"
                                    placeholder={targetType === "option" ? "e.g., Size, Color" : "e.g., Red, XL"}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                        </div>
                    )}

                    {action === ActionTypes.DELETE && (
                        <p className="mb-1.5 mt-4 block font-medium modal-title text-gray-700 dark:text-gray-400">
                            Are you sure you want to remove this {targetType === "option" ? "Option" : "Option Value"}?
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
                        {loading
                            ? action === ActionTypes.DELETE
                                ? "Deleting..."
                                : "Saving..."
                            : action === ActionTypes.DELETE
                                ? "Delete"
                                : action === ActionTypes.CREATE
                                    ? "+ Save"
                                    : "Update"}
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
