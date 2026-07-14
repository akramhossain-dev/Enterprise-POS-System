export interface PermissionGroup {
  module: string;
  permissions: {
    id: string;
    name: string;
    action: string;
    description?: string | null;
  }[];
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: {
    id: string;
    name: string;
    module: string;
    action: string;
  }[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
