"use client";
import {useRef, useState} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import DatePicker from "@/components/form/date-picker";
import {EmployeeService} from "@/service/employee.service";
import {EmployeeCreateRequest, EmployeeData} from "@/type/Employee";

interface EmployeeFormProps {
    employee?: EmployeeData;
}

export default function EmployeeForm({employee}: EmployeeFormProps) {
    const router = useRouter();
    const isEdit = !!employee;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [firstName, setFirstName] = useState(employee?.firstName ?? "");
    const [lastName, setLastName] = useState(employee?.lastName ?? "");
    const [gender, setGender] = useState(employee?.gender ?? "");
    const [email, setEmail] = useState(employee?.email ?? "");
    const [password, setPassword] = useState("");
    const [joinDate, setJoinDate] = useState(employee?.joinDate ?? "");
    const [phone, setPhone] = useState(employee?.phone ?? "");

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        employee?.imageUrl ? `/media${employee.imageUrl.replace(/^\/api\/asset/, '')}` : null
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (
            !firstName.trim() ||
            !lastName.trim() ||
            !gender ||
            !email.trim() ||
            (!isEdit && !password) ||
            !phone.trim() ||
            !joinDate
        ) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        setError("");

        const payload: EmployeeCreateRequest = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            gender,
            email: email.trim(),
            ...(!isEdit ? {password} : {}),
            phone: phone.trim(),
            joinDate,
        };

        try {
            if (isEdit && employee) {
                await EmployeeService.update(employee.id, payload, selectedFile ?? undefined);
            } else {
                await EmployeeService.save(payload, selectedFile ?? undefined);
            }

            router.push("/employee");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";
    const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

    return (
        <div>
            <PageBreadcrumb pageTitle={isEdit ? "Edit Employee" : "Add Employee"}/>
            <div className="space-y-6">
                <ComponentCard>
                    <div className="p-6 lg:p-8 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Profile Image Upload */}
                        <div>
                            <label className={labelClass}>Profile Image</label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-20 h-20 overflow-hidden rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                    {previewUrl ? (
                                        <Image
                                            src={previewUrl}
                                            alt="Profile preview"
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover rounded-full"
                                            unoptimized
                                        />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                        className="hidden"
                                        id="profile-image-upload"
                                    />
                                    <label
                                        htmlFor="profile-image-upload"
                                        className="cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        Choose Image
                                    </label>
                                    {previewUrl && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first-name" className={labelClass}>First Name</label>
                                <input
                                    id="first-name"
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="last-name" className={labelClass}>Last Name</label>
                                <input
                                    id="last-name"
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Gender</label>
                            <div className="flex items-center gap-5">
                                <label className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="MALE"
                                        checked={gender === "MALE"}
                                        onChange={() => setGender("MALE")}
                                        disabled={loading}
                                        className="mr-2"
                                    />
                                    Male
                                </label>
                                <label className="flex items-center text-sm text-gray-700 dark:text-gray-400">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="FEMALE"
                                        checked={gender === "FEMALE"}
                                        onChange={() => setGender("FEMALE")}
                                        disabled={loading}
                                        className="mr-2"
                                    />
                                    Female
                                </label>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 ${!isEdit ? 'sm:grid-cols-2' : ''} gap-4`}>
                            <div>
                                <label htmlFor="email" className={labelClass}>Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            {!isEdit && (
                                <div>
                                    <label htmlFor="password" className={labelClass}>Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className={inputClass}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className={labelClass}>Phone Number</label>
                                <input
                                    id="phone"
                                    type="text"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <DatePicker
                                    id="join-date"
                                    label="Join Date"
                                    placeholder="Select date"
                                    defaultDate={joinDate}
                                    disabled={loading}
                                    onChange={(_, dateStr) => setJoinDate(dateStr)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={loading}>
                                {loading
                                    ? isEdit ? "Updating..." : "Saving..."
                                    : isEdit ? "Update Employee" : "+ Add Employee"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.push("/employee")}
                                disabled={loading}
                                className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
}
