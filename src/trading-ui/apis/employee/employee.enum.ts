export enum EmployeeRoleType {
  Root = 'root',
  Admin = 'admin',
  Staff = 'staff',
  Guest = 'guest',
}

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRoleType, string> = {
  [EmployeeRoleType.Root]: 'Root',
  [EmployeeRoleType.Admin]: 'Admin',
  [EmployeeRoleType.Staff]: 'Nhân viên',
  [EmployeeRoleType.Guest]: 'Khách',
};

const normalizeRoleToken = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/** Ưu tiên `user.roleType` từ login; fallback `roles[]` / JWT. */
export const resolveCreatorEmployeeRoleType = (roles?: string[] | null, roleType?: string | null): EmployeeRoleType => {
  const fromRoleType = normalizeRoleToken(roleType);
  if (fromRoleType === EmployeeRoleType.Root) return EmployeeRoleType.Root;
  if (fromRoleType === EmployeeRoleType.Admin) return EmployeeRoleType.Admin;
  if (fromRoleType === EmployeeRoleType.Staff) return EmployeeRoleType.Staff;
  if (fromRoleType === EmployeeRoleType.Guest) return EmployeeRoleType.Guest;

  const normalized = (roles ?? []).map(normalizeRoleToken);
  if (normalized.includes(EmployeeRoleType.Root)) return EmployeeRoleType.Root;
  if (normalized.includes(EmployeeRoleType.Admin)) return EmployeeRoleType.Admin;
  if (normalized.includes(EmployeeRoleType.Staff)) return EmployeeRoleType.Staff;
  if (normalized.includes(EmployeeRoleType.Guest)) return EmployeeRoleType.Guest;
  return EmployeeRoleType.Staff;
};

/** Loại tài khoản được phép tạo theo role người đăng nhập (không tạo thêm Root). */
export const getCreatableEmployeeRoles = (creatorRole: EmployeeRoleType): EmployeeRoleType[] => {
  switch (creatorRole) {
    case EmployeeRoleType.Root:
      return [EmployeeRoleType.Admin, EmployeeRoleType.Staff, EmployeeRoleType.Guest];
    case EmployeeRoleType.Admin:
      return [EmployeeRoleType.Staff, EmployeeRoleType.Guest];
    case EmployeeRoleType.Staff:
      return [EmployeeRoleType.Guest];
    case EmployeeRoleType.Guest:
    default:
      return [];
  }
};

export const canCreateEmployeeAccount = (creatorRole: EmployeeRoleType): boolean => getCreatableEmployeeRoles(creatorRole).length > 0;

/** Admin không xem mã perm / mapping API trong trung tâm phân quyền; Root vẫn thấy đủ. */
export const shouldHidePermissionApiDetails = (roleType: EmployeeRoleType): boolean => roleType === EmployeeRoleType.Admin;

/** Root sửa mọi tài khoản; Admin chỉ sửa tài khoản do chính mình tạo (`createdById`); Staff không sửa ai. */
export const canManageEmployeeByOwnership = (managerRole: EmployeeRoleType, managerId: string, targetCreatedById: string | null | undefined): boolean => {
  if (managerRole === EmployeeRoleType.Root) return true;
  if (managerRole === EmployeeRoleType.Admin) {
    const owner = String(targetCreatedById ?? '').trim();
    return Boolean(owner) && owner === String(managerId ?? '').trim();
  }
  return false;
};

const EMPLOYEE_ROLE_RANK: Record<EmployeeRoleType, number> = {
  [EmployeeRoleType.Root]: 4,
  [EmployeeRoleType.Admin]: 3,
  [EmployeeRoleType.Staff]: 2,
  [EmployeeRoleType.Guest]: 1,
};

export const compareEmployeeRoleRank = (left: EmployeeRoleType, right: EmployeeRoleType): number => EMPLOYEE_ROLE_RANK[left] - EMPLOYEE_ROLE_RANK[right];

/** Người quản lý phải có rank cao hơn tài khoản cấp dưới mới được PATCH /iam/employee/{id}. */
export const canManageSubordinateEmployee = (managerRole: EmployeeRoleType, targetRole: EmployeeRoleType): boolean => compareEmployeeRoleRank(managerRole, targetRole) > 0;

/** RoleType được phép gán khi cập nhật cấp dưới — không vượt quyền tạo tài khoản của người thao tác. */
export const getUpdatableSubordinateRoleTypes = (managerRole: EmployeeRoleType): EmployeeRoleType[] => getCreatableEmployeeRoles(managerRole);

export const canAssignSubordinateRoleType = (managerRole: EmployeeRoleType, targetRole: EmployeeRoleType, nextRoleType: EmployeeRoleType): boolean => {
  if (!canManageSubordinateEmployee(managerRole, targetRole)) return false;
  return getUpdatableSubordinateRoleTypes(managerRole).includes(nextRoleType);
};
