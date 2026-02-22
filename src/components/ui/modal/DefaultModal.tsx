import {Modal} from "@/components/ui/modal/index";
import {ActionTypes} from "@/constant/actionType";
import Button from "@/components/ui/button/Button";
import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    header: React.ReactNode;
    body: React.ReactNode;
    footer: React.ReactNode;
}

export const DefaultModal: React.FC<ModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       header,
                                                       body,
                                                       footer,
                                                   }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] p-6 lg:p-3"
        >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        {header}
                    </h5>
                </div>

                <div className="mt-4 modal-body">
                    {body}
                </div>

                {footer}
            </div>
        </Modal>
    );
}