import { PaginationQueryDto } from "../../dto/pagination.dto";
export declare class UserSearchQueryDto extends PaginationQueryDto {
    search?: string;
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
}
export declare class ToggleActiveDto {
    isActive: boolean;
}
export declare class ToggleVerifiedDto {
    isVerified: boolean;
}
export declare class ChangeRoleDto {
    role: string;
}
export declare class UpdateUserDto {
    displayName?: string;
    username?: string;
    bio?: string;
}
