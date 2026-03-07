"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import React, {useEffect, useRef, useState} from "react";
import {useModal} from "@/hooks/useModal";
import EmployeeModal from "@/app/(admin)/(others-pages)/employee/EmployeeModal";
import {MoreDotIcon} from "@/icons";
import ActionDropdown from "@/components/common/ActionDropdown";
import { Employee, EmployeeData } from "@/type/Employee";
import { EmployeeService } from "@/service/employee.service";
import {ActionTypes} from "@/constant/actionType";
import DatePicker from "@/components/form/date-picker";

const EmployeeTable: React.FC = () => {

    const {isOpen, openModal, closeModal} = useModal();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
    const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing
    const [pageSize] = useState(5);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData>();
    const [action, setAction] = useState<ActionTypes>(ActionTypes.CREATE);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterJoinDate, setFilterJoinDate] = useState("");
    const [isSearching, setIsSearching] = useState(false);

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


    const openModalCreate = () => {
        setAction(ActionTypes.CREATE);
        setSelectedEmployee(undefined);
        openModal();
    }

    const handleEditEmployee = (employee: EmployeeData) => {
        setAction(ActionTypes.UPDATE);
        setSelectedEmployee(employee);
        openModal();
    }

    const handleDeleteEmployee = (employee: EmployeeData) => {
        setAction(ActionTypes.DELETE);
        setSelectedEmployee(employee);
        openModal();
    }

    const handleViewEmployee = (employee: EmployeeData) => {
        setAction(ActionTypes.VIEW);
        setSelectedEmployee(employee);
        openModal();
    }

    const handleCloseModal = () => {
        setSelectedEmployee(undefined);
        closeModal();
    }

    const fetchEmployees = async (name?: string, joinDate?: string) => {
        try {
            const response: Employee = await EmployeeService.getAll(currentPage, pageSize, name, joinDate);
            setEmployeeData(response.employeeData);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleFilter = () => {
        setIsSearching(true);
        fetchEmployees(filterName, filterJoinDate);
    };

    const clearFilters = () => {
        setFilterName("");
        setFilterJoinDate("");
        setSearchTerm("");
        setIsSearching(false);
        fetchEmployees();
    };

    const handleSearchByID = async () => {
        if (!searchTerm.trim()) {
            fetchEmployees();
            return;
        }

        try {
            const id = Number(searchTerm);
            if (isNaN(id)) {
                alert("Please enter a valid numeric ID");
                return;
            }
            const employee = await EmployeeService.getById(id);
            setEmployeeData(employee ? [employee] : []);
        } catch (error) {
            console.error('Error searching employee:', error);
            setEmployeeData([]);
        }
    };

    useEffect(() => {
        if (!isSearching && !searchTerm) {
            fetchEmployees();
        }
    }, [currentPage, pageSize]);

    const handleSuccess = () => {
        fetchEmployees();
    };
    
    return (
        <div>
            <EmployeeModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                onSuccess={handleSuccess}
                action={action}
                employee={selectedEmployee}
            />
            <PageBreadcrumb pageTitle="Employee"/>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="flex flex-wrap items-center gap-4 flex-grow">
                        <div className="w-full sm:w-auto min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Filter by Name..."
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                        <div className="w-full sm:w-auto min-w-[200px]">
                            <DatePicker
                                id="filter-join-date"
                                placeholder="Filter by Join Date"
                                defaultDate={filterJoinDate}
                                onChange={(_, dateStr) => setFilterJoinDate(dateStr)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="primary" onClick={handleFilter}>
                                Filter
                            </Button>
                            {(filterName || filterJoinDate || searchTerm) && (
                                <Button size="sm" variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
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
                                                First Name
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                  Last Name
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
                                                Phone
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Gender
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-bold text-gray-500 text-start dark:text-gray-400"
                                            >
                                                Join Date
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
                                        {employeeData.map((employee) => (
                                            <TableRow key={employee.id}>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.id}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 overflow-hidden rounded-full">
                                                            <img
                                                                src={``}
                                                                alt={``}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.firstName}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.lastName}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.email}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.phone || "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.gender}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {employee.joinDate}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-gray-500 text-sm">
                                                    <div className="relative" ref={openDropdownId === employee.id ? dropdownRef : null}>
                                                        <button onClick={() => toggleDropdown(employee.id)} className="p-2">
                                                            <MoreDotIcon />
                                                        </button>
                                                        {openDropdownId === employee.id && (
                                                            <ActionDropdown
                                                                data={employee}
                                                                onView={handleViewEmployee}
                                                                onEdit={handleEditEmployee}
                                                                onDelete={handleDeleteEmployee}
                                                            />
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
