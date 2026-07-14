import { ApiClient } from './api-client';
import { apiConfig } from '@/config/api';
import type { AdminRole, PermissionGroup } from '@/types/role';
import type { Permission, Role } from '@/types/auth';

const STORAGE_KEY = 'pos_custom_roles';

class AdminRoleService extends ApiClient {
  private getCustomRoles(): AdminRole[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AdminRole[]) : [];
  }

  private saveCustomRoles(roles: AdminRole[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }

  async listPermissions(): Promise<PermissionGroup[]> {
    // Fetch base permissions from API endpoint /permissions
    const response = await this.get<Permission[]>(apiConfig.endpoints.permissions);
    const apiPermissions = response.data;

    // Group permissions by module category
    const groupsMap = new Map<string, any[]>();
    apiPermissions.forEach((p) => {
      const moduleName = p.resource || 'System';
      if (!groupsMap.has(moduleName)) {
        groupsMap.set(moduleName, []);
      }
      groupsMap.get(moduleName)!.push({
        id: p.id,
        name: p.name,
        action: p.action,
        description: p.description || `Allow ${p.action} actions on ${p.resource} module`,
      });
    });

    const groups: PermissionGroup[] = [];
    groupsMap.forEach((permissions, module) => {
      groups.push({ module, permissions });
    });

    return groups;
  }

  async listRoles(): Promise<AdminRole[]> {
    // Fetch base roles from API endpoint /roles
    const response = await this.get<Role[]>(apiConfig.endpoints.roles);
    const apiRoles = response.data;

    const baseRoles: AdminRole[] = apiRoles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || `${r.name} role with pre-configured access rights`,
      permissions: r.permissions.map((pName) => ({
        id: pName,
        name: pName,
        module: pName.split('.')[0] || 'general',
        action: pName.split('.')[1] || 'read',
      })),
      isSystem: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const customRoles = this.getCustomRoles();
    return [...baseRoles, ...customRoles];
  }

  async getRole(id: string): Promise<AdminRole> {
    const all = await this.listRoles();
    const role = all.find((r) => r.id === id);
    if (!role) throw new Error('Role details not found');
    return role;
  }

  async createRole(payload: {
    name: string;
    description?: string | null;
    permissions: string[];
  }): Promise<AdminRole> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const customs = this.getCustomRoles();

    // Resolve full permission objects from names
    const resolvedPermissions = payload.permissions.map((pName) => ({
      id: pName,
      name: pName,
      module: pName.split('.')[0] || 'general',
      action: pName.split('.')[1] || 'read',
    }));

    const newRole: AdminRole = {
      id: `role-${Math.random().toString(36).substr(2, 9)}`,
      name: payload.name.toUpperCase(),
      description: payload.description,
      permissions: resolvedPermissions,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customs.push(newRole);
    this.saveCustomRoles(customs);
    return newRole;
  }

  async updateRole(
    id: string,
    payload: { name?: string; description?: string | null; permissions?: string[] },
  ): Promise<AdminRole> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const customs = this.getCustomRoles();
    const idx = customs.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(
        'Only custom roles can be modified in the local mock layer. System roles are write-protected.',
      );
    }

    const target = customs[idx]!;
    const updated: AdminRole = {
      ...target,
      ...(payload.name ? { name: payload.name.toUpperCase() } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.permissions
        ? {
            permissions: payload.permissions.map((pName) => ({
              id: pName,
              name: pName,
              module: pName.split('.')[0] || 'general',
              action: pName.split('.')[1] || 'read',
            })),
          }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    customs[idx] = updated;
    this.saveCustomRoles(customs);
    return updated;
  }

  async deleteRole(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const customs = this.getCustomRoles();
    const updated = customs.filter((r) => r.id !== id);
    this.saveCustomRoles(updated);
  }
}

export const adminRoleService = new AdminRoleService();
