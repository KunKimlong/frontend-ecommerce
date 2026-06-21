import {AuditableResult, User} from "@/type/User";

export interface Option {
    data: OptionData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface OptionData {
    id: number;
    name: string;
    createdBy: AuditableResult;
    updatedBy: AuditableResult;
}

export interface OptionRequest {
    name: string;
}

export interface OptionValue {
    data: OptionValueData[];
    total: number;
    page: number;
    pageSize: number;
}

export interface OptionValueData {
    id: number;
    name: string;
    option: OptionData;
    createdBy: AuditableResult;
    updatedBy: AuditableResult;
}

export interface OptionValueRequest {
    name: string;
    optionId: number;
}
