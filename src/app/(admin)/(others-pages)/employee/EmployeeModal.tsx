import React, {useEffect, useState} from "react";
import {Modal} from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {AssetService} from "@/service/asset.service";
import {EmployeeService} from "@/service/employee.service";
import {AssetData} from "@/type/Asset";
import {EmployeeCreateRequest, EmployeeData} from "@/type/Employee";
import {ActionTypes} from "@/constant/actionType";

import DatePicker from "@/components/form/date-picker";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSuccess: () => void;
    action: ActionTypes;
    employee?: EmployeeData;
}

export default function EmployeeModal({
                                          isOpen,
                                          closeModal,
                                          onSuccess,
                                          action,
                                          employee,
                                      }: ModalProps) {
                                        //set state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [joinDate, setJoinDate] = useState("");
    const [phone, setPhone] = useState("");
    const [assetId, setAssetId] = useState<number | "">("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        if ((action === ActionTypes.UPDATE || action === ActionTypes.VIEW) && employee) {
            //set show in form when update
            setFirstName(employee.firstName || "");
            setLastName(employee.lastName || "");
            setGender(employee.gender || "");
            setEmail(employee.email || "");
            setPassword(""); // Don't populate password
            setJoinDate(employee.joinDate || "");
            setPhone(employee.phone || "");
            setError("");
        } else {
            //set clear form when create
            setFirstName("");
            setLastName("");
            setGender("");
            setEmail("");
            setPassword("");
            setJoinDate("");
            setPhone("");
            setError("");
        }

    }, [isOpen]);

    const handleSubmit = async () => {
        setError("");

        if (action !== ActionTypes.DELETE) {
            if (
                !firstName.trim() ||
                !lastName.trim() ||
                !gender ||
                !email.trim() ||
                (action === ActionTypes.CREATE && !password) ||
                !phone.trim() ||
                !joinDate
            ) {
                setError("Please fill in all required fields");
                return;
            }
        }
        //payload for create and update
        const payload: EmployeeCreateRequest = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            gender,
            email: email.trim(),
            password,
            phone: phone.trim(),
            joinDate
        };

        setSaving(true);
        try {
            if (action === ActionTypes.CREATE) {
                await EmployeeService.save(payload);
            } else if (action === ActionTypes.UPDATE && employee) {
                const updatePayload: Partial<EmployeeCreateRequest> = { ...payload };
                if (!password) delete updatePayload.password;
                await EmployeeService.update(employee.id, updatePayload);
            } else if (action === ActionTypes.DELETE && employee) {
                await EmployeeService.delete(employee.id);
            }
            onSuccess();
            closeModal();
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Error saving employee");
        } finally {
            setSaving(false);
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
                        {action === ActionTypes.CREATE && "Add Employee"}
                        {action === ActionTypes.UPDATE && "Edit Employee"}
                        {action === ActionTypes.DELETE && "Delete Employee"}
                        {action === ActionTypes.VIEW && "Employee Details"}
                    </h5>

                    {error && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>
                <div className="mt-8">
                    {(action !== ActionTypes.DELETE) ? (
                        <div className={"flex flex-wrap"}>
                            {/* ... existing fields ... */}
                            <div className={"w-1/2 p-1"}>
                                <label htmlFor={"first-name"}
                                       className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    First Name
                                </label>
                                <input
                                    id="first-name"
                                    type="text"
                                    placeholder={"First Name"}
                                    value={firstName}
                                    disabled={action === ActionTypes.VIEW}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-70"
                                />
                            </div>
                            <div className={"w-1/2 p-1"}>
                                <label htmlFor={"last-name"}
                                       className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Last Name
                                </label>
                                <input
                                    id="last-name"
                                    type="text"
                                    placeholder={"Last Name"}
                                    value={lastName}
                                    disabled={action === ActionTypes.VIEW}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-70"
                                />
                            </div>
                            <div className={"w-1/2 p-1"}>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Gender
                                </label>
                                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                                    <label
                                        className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                                        htmlFor={`modalMale`}
                                    >
                                        <span className="relative">
                                          <input
                                              className="sr-only form-check-input"
                                              type="radio"
                                              name="event-level"
                                              value="MALE"
                                              id={`modalMale`}
                                              checked={gender === "MALE"}
                                              disabled={action === ActionTypes.VIEW}
                                              onChange={() => setGender("MALE")}
                                          />
                                          <span
                                              className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                                            <span
                                                className={`h-2 w-2 rounded-full bg-white ${
                                                    gender === "MALE" ? "block" : "hidden"
                                                }`}
                                            >

                                            </span>
                                          </span>
                                        </span>
                                        ​Male
                                    </label>

                                    <label
                                        className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                                        htmlFor={`modalFemale`}
                                    >
                                        <span className="relative">
                                          <input
                                              className="sr-only form-check-input"
                                              type="radio"
                                              name="event-level"
                                              value="FEMALE"
                                              id={`modalFemale`}
                                              checked={gender === "FEMALE"}
                                              disabled={action === ActionTypes.VIEW}
                                              onChange={() => setGender("FEMALE")}
                                          />
                                          <span
                                              className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                                            <span
                                                className={`h-2 w-2 rounded-full bg-white ${
                                                    gender === "FEMALE" ? "block" : "hidden"
                                                }`}
                                            >
                                            </span>
                                          </span>
                                        </span>
                                        Female
                                    </label>
                                </div>
                            </div>
                            <div className={"w-1/2 p-1"}>
                                <label htmlFor="email"
                                       className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="text"
                                    placeholder={"Email"}
                                    value={email}
                                    disabled={action === ActionTypes.VIEW}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-70"
                                />
                            </div>
                            {action !== ActionTypes.VIEW && (
                                <div className={"w-1/2 p-1"}>
                                    <label htmlFor="password"
                                           className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                        Password {action === ActionTypes.UPDATE && "(leave blank to keep current)"}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder={"Password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    />
                                </div>
                            )}
                            <div className={"w-1/2 p-1"}>
                                <label htmlFor="phone"
                                       className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    type="text"
                                    placeholder={"Phone Number"}
                                    value={phone}
                                    disabled={action === ActionTypes.VIEW}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 disabled:opacity-70"
                                />
                            </div>
                     
                            <div className={"w-1/2 p-1"}>
                                <DatePicker
                                    id="join-date"
                                    label="Join Date"
                                    placeholder="Select date"
                                    defaultDate={joinDate}
                                    disabled={action === ActionTypes.VIEW}
                                    onChange={(_, dateStr) => setJoinDate(dateStr)}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete employee <strong>{employee?.firstName} {employee?.lastName}</strong>?
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    {action !== ActionTypes.VIEW && (
                        <Button
                            size="sm"
                            variant={action === ActionTypes.DELETE ? "danger" : "primary"}
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving
                                ? action === ActionTypes.DELETE
                                    ? "Deleting..."
                                    : action === ActionTypes.UPDATE
                                        ? "Updating..."
                                        : "Saving..."
                                : action === ActionTypes.DELETE
                                    ? "Delete"
                                    : action === ActionTypes.UPDATE
                                        ? "Update"
                                        : "+ Employee"}
                        </Button>
                    )}
                    <button
                        onClick={closeModal}
                        type="button"
                        disabled={saving}
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto disabled:opacity-50"
                    >
                        Close
                    </button>

                </div>
            </div>
        </Modal>
    )
}

