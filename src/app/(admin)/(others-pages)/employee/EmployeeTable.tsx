"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import React, {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import EmployeeModal from "@/app/(admin)/(others-pages)/employee/EmployeeModal";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";

const EmployeeTable: React.FC = () => {

    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };
    interface Order {
        id: number;
        user: {
            image: string;
            name: string;
            role: string;
        };
        projectName: string;
        team: {
            images: string[];
        };
        status: string;
        budget: string;
    }

    const openModalCreate = () => {
        openModal();
    }

    const tableData: Order[] = [
        {
            id: 1,
            user: {
                image: "/images/user/user-17.jpg",
                name: "Lindsey Curtis",
                role: "Web Designer",
            },
            projectName: "Agency Website",
            team: {
                images: [
                    "/images/user/user-22.jpg",
                    "/images/user/user-23.jpg",
                    "/images/user/user-24.jpg",
                ],
            },
            budget: "3.9K",
            status: "Active",
        },
        {
            id: 2,
            user: {
                image: "/images/user/user-18.jpg",
                name: "Kaiya George",
                role: "Project Manager",
            },
            projectName: "Technology",
            team: {
                images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
            },
            budget: "24.9K",
            status: "Pending",
        },
        {
            id: 3,
            user: {
                image: "/images/user/user-17.jpg",
                name: "Zain Geidt",
                role: "Content Writing",
            },
            projectName: "Blog Writing",
            team: {
                images: ["/images/user/user-27.jpg"],
            },
            budget: "12.7K",
            status: "Active",
        },
        {
            id: 4,
            user: {
                image: "/images/user/user-20.jpg",
                name: "Abram Schleifer",
                role: "Digital Marketer",
            },
            projectName: "Social Media",
            team: {
                images: [
                    "/images/user/user-28.jpg",
                    "/images/user/user-29.jpg",
                    "/images/user/user-30.jpg",
                ],
            },
            budget: "2.8K",
            status: "Cancel",
        },
        {
            id: 5,
            user: {
                image: "/images/user/user-21.jpg",
                name: "Carla George",
                role: "Front-end Developer",
            },
            projectName: "Website",
            team: {
                images: [
                    "/images/user/user-31.jpg",
                    "/images/user/user-32.jpg",
                    "/images/user/user-33.jpg",
                ],
            },
            budget: "4.5K",
            status: "Active",
        },
    ];
    return (
        <div>
            <EmployeeModal isOpen={isOpen} closeModal={closeModal}></EmployeeModal>
            <PageBreadcrumb pageTitle="Employee"/>
            <div className="space-y-6">
                <div className={"flex justify-end"}>
                    <Button size="sm" variant="primary" onClick={openModalCreate}>
                        + Employee
                    </Button>
                </div>
                <ComponentCard>
                    <div
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1102px]">
                                <Table>
                                    {/* Table Header */}
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                ID
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Profile
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Full Name
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Email
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Status
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    {/* Table Body */}
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {tableData.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 overflow-hidden rounded-full">
                                                            <Image
                                                                width={40}
                                                                height={40}
                                                                src={order.user.image}
                                                                alt={order.user.name}
                                                            />
                                                        </div>
                                                        <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.user.name}
                        </span>
                                                            <span
                                                                className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {order.user.role}
                        </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {order.projectName}
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <div className="flex -space-x-2">
                                                        {order.team.images.map((teamImage, index) => (
                                                            <div
                                                                key={index}
                                                                className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                                                            >
                                                                <Image
                                                                    width={24}
                                                                    height={24}
                                                                    src={teamImage}
                                                                    alt={`Team member ${index + 1}`}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <Badge
                                                        size="sm"
                                                        color={
                                                            order.status === "Active"
                                                                ? "success"
                                                                : order.status === "Pending"
                                                                    ? "warning"
                                                                    : "error"
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {order.budget}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                    <div className="relative" ref={openDropdownId === order.id ? dropdownRef : null}>
                                                        <button onClick={() => toggleDropdown(order.id)} className="p-2">
                                                            <MoreDotIcon />
                                                        </button>
                                                        {openDropdownId === order.id && (
                                                            <ActionDropdown id={order.id} />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </ComponentCard>
            </div>

        </div>
    );
}


export default EmployeeTable;