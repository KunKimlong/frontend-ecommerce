import React, {useState} from "react";
import {Modal} from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

export default function EmployeeModal({
                                          isOpen,
                                          closeModal,
                                      }: ModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [joinDate, setJoinDate] = useState("");
    const [phone, setPhone] = useState("");
    const [profile, setProfile] = useState<File | null>(null);
    const handleSubmit = async () => {
        if (!profile) {
            alert("Please select profile image");
            return;
        }

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("gender", gender);
        formData.append("role", role);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("phone", phone);
        formData.append("joinDate", joinDate);
        formData.append("profile", profile); // 👈 file

        try {
            const res = await fetch("http://localhost:8080/api/employees", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to save employee");

            closeModal(); // ✅ close modal
        } catch (error) {
            console.error(error);
            alert("Error saving employee");
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
                        Add Employee
                    </h5>

                </div>
                <div className="mt-8">
                    <div className={"flex flex-wrap"}>
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
                                onChange={(e) => setFirstName(e.target.value)}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                                onChange={(e) => setLastName(e.target.value)}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                                          value="Male"
                                          id={`modalMale`}
                                          onChange={() => setGender("Male")}
                                      />
                                      <span
                                          className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                                        <span
                                            className={`h-2 w-2 rounded-full bg-white ${
                                                gender === "Male" ? "block" : "hidden"
                                            }`}
                                        >

                                        </span>
                                      </span>
                                    </span>
                                    Male
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
                                          value="Female"
                                          id={`modalFemale`}
                                          onChange={() => setGender("Female")}
                                      />
                                      <span
                                          className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                                        <span
                                            className={`h-2 w-2 rounded-full bg-white ${
                                                gender === "Female" ? "block" : "hidden"
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
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Role
                            </label>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                                <label
                                    className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                                    htmlFor={`modalAdmin`}
                                >
                                    <span className="relative">
                                      <input
                                          className="sr-only form-check-input"
                                          type="radio"
                                          name="event-level"
                                          value="Admin"
                                          id={`modalAdmin`}
                                          onChange={() => setRole("Admin")}
                                      />
                                      <span
                                          className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                                        <span
                                            className={`h-2 w-2 rounded-full bg-white ${
                                                role === "Admin" ? "block" : "hidden"
                                            }`}
                                        >

                                        </span>
                                      </span>
                                    </span>
                                    Admin
                                </label>
                                <label
                                    className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                                    htmlFor={`modalEmployee`}
                                >
                                    <span className="relative">
                                      <input
                                          className="sr-only form-check-input"
                                          type="radio"
                                          name="event-level"
                                          value="Employee"
                                          id={`modalEmployee`}
                                          onChange={() => setRole("Employee")}
                                      />
                                      <span
                                          className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                                        <span
                                            className={`h-2 w-2 rounded-full bg-white ${
                                                role === "Employee" ? "block" : "hidden"
                                            }`}
                                        >

                                        </span>
                                      </span>
                                    </span>
                                    Employee
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
                                onChange={(e) => setEmail(e.target.value)}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                        <div className={"w-1/2 p-1"}>
                            <label htmlFor="password"
                                   className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Password
                            </label>
                            <input
                                id="password"
                                type="text"
                                placeholder={"Password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                        <div className={"w-1/2 p-1"}>
                            <label htmlFor="password"
                                   className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="text"
                                placeholder={"Phone Number"}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                        <div className={"w-1/2 p-1"}>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                Join Date
                            </label>
                            <div className="relative">
                                <input
                                    id="event-start-date"
                                    type="date"
                                    value={joinDate}
                                    onChange={(e) => setJoinDate(e.target.value)}
                                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                        </div>
                        <div className={"w-full p-1"}>
                            <label htmlFor="profile"
                                   className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                            >
                                Profile
                            </label>
                            <input
                                type="file"
                                className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                onChange={(e) => setProfile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                </div>
                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    <Button size="sm" variant="primary" onClick={handleSubmit}>
                        + Employee
                    </Button>
                    <button
                        onClick={closeModal}
                        type="button"
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                    >
                        Close
                    </button>

                </div>
            </div>
        </Modal>
    )
}