import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import {
  CreateAccountCategoryPayload,
  CreateAccountPayload,
  UpdateAccountPayload,
} from './account.schema';
import { MappedAccount, MappedAccountCategory, AccountQuery } from './account.types';
import {
  findAccountById,
  findAccountByCode,
  findAccounts,
  findCategories,
  mapAccount,
  mapAccountCategory,
} from './account.repository';
import { buildPaginationMeta } from '../../common/utils/query';

async function getCompanyIdForUser(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) {
    throw new ForbiddenError('User is not associated with any company profile');
  }
  return employee.companyId;
}

export async function createAccountCategory(
  payload: CreateAccountCategoryPayload,
  userId: string,
): Promise<MappedAccountCategory> {
  const companyId = await getCompanyIdForUser(userId);

  const existing = await prisma.accountCategory.findUnique({
    where: {
      companyId_name: {
        companyId,
        name: payload.name,
      },
    },
  });

  if (existing) {
    throw new BadRequestError(`Account category "${payload.name}" already exists`);
  }

  const cat = await prisma.accountCategory.create({
    data: {
      companyId,
      name: payload.name,
      type: payload.type,
    },
  });

  console.warn(`[AUDIT] Account Category Created: ${cat.id}`);
  return mapAccountCategory(cat);
}

export async function listAccountCategories(userId: string): Promise<MappedAccountCategory[]> {
  const companyId = await getCompanyIdForUser(userId);
  const categories = await findCategories(companyId);
  return categories.map(mapAccountCategory);
}

export async function createAccount(
  payload: CreateAccountPayload,
  userId: string,
): Promise<MappedAccount> {
  const companyId = await getCompanyIdForUser(userId);

  // 1. Verify category exists and belongs to company
  const category = await prisma.accountCategory.findFirst({
    where: { id: payload.categoryId, companyId },
  });
  if (!category) {
    throw new NotFoundError(`Account category with ID "${payload.categoryId}" not found`);
  }

  // 2. Validate category type matches account type
  if (category.type !== payload.type) {
    throw new BadRequestError(
      `Account type (${payload.type}) does not match the selected category type (${category.type})`,
    );
  }

  // 3. Parent account validation
  if (payload.parentId) {
    const parent = await prisma.account.findFirst({
      where: { id: payload.parentId, companyId },
    });
    if (!parent) {
      throw new NotFoundError(`Parent account with ID "${payload.parentId}" not found`);
    }
    if (parent.type !== payload.type) {
      throw new BadRequestError(
        `Child account type (${payload.type}) must match parent account type (${parent.type})`,
      );
    }
  }

  // 4. Unique accountCode validation
  const existingCode = await findAccountByCode(companyId, payload.accountCode);
  if (existingCode) {
    throw new BadRequestError(`Account code "${payload.accountCode}" is already in use`);
  }

  const opening = payload.openingBalance ?? 0;

  const account = await prisma.account.create({
    data: {
      companyId,
      categoryId: payload.categoryId,
      parentId: payload.parentId ?? null,
      accountCode: payload.accountCode,
      name: payload.name,
      type: payload.type,
      openingBalance: opening,
      currentBalance: opening,
      status: payload.status ?? 'ACTIVE',
    },
  });

  const fresh = await findAccountById(account.id);
  if (!fresh) {
    throw new NotFoundError('Failed to retrieve created account');
  }

  console.warn(`[AUDIT] Account Created: ${account.id}`);
  return mapAccount(fresh);
}

export async function updateAccount(
  id: string,
  payload: UpdateAccountPayload,
  userId: string,
): Promise<MappedAccount> {
  const companyId = await getCompanyIdForUser(userId);

  const account = await prisma.account.findFirst({
    where: { id, companyId },
  });
  if (!account) {
    throw new NotFoundError(`Account with ID "${id}" not found`);
  }

  // 1. Category update check
  if (payload.categoryId) {
    const category = await prisma.accountCategory.findFirst({
      where: { id: payload.categoryId, companyId },
    });
    if (!category) {
      throw new NotFoundError(`Account category with ID "${payload.categoryId}" not found`);
    }
    if (category.type !== account.type) {
      throw new BadRequestError(
        `Account category type (${category.type}) must match current account type (${account.type})`,
      );
    }
  }

  // 2. Parent account update check
  if (payload.parentId) {
    if (payload.parentId === id) {
      throw new BadRequestError('An account cannot be its own parent');
    }
    const parent = await prisma.account.findFirst({
      where: { id: payload.parentId, companyId },
    });
    if (!parent) {
      throw new NotFoundError(`Parent account with ID "${payload.parentId}" not found`);
    }
    if (parent.type !== account.type) {
      throw new BadRequestError(
        `Child account type (${account.type}) must match parent account type (${parent.type})`,
      );
    }
  }

  // 3. Unique accountCode check
  if (payload.accountCode && payload.accountCode !== account.accountCode) {
    const existingCode = await findAccountByCode(companyId, payload.accountCode);
    if (existingCode) {
      throw new BadRequestError(`Account code "${payload.accountCode}" is already in use`);
    }
  }

  const updateData: Prisma.AccountUncheckedUpdateInput = {};
  if (payload.categoryId !== undefined) {
    updateData.categoryId = payload.categoryId;
  }
  if (payload.parentId !== undefined) {
    updateData.parentId = payload.parentId;
  }
  if (payload.accountCode !== undefined) {
    updateData.accountCode = payload.accountCode;
  }
  if (payload.name !== undefined) {
    updateData.name = payload.name;
  }
  if (payload.status !== undefined) {
    updateData.status = payload.status;
  }

  await prisma.account.update({
    where: { id },
    data: updateData,
  });

  const fresh = await findAccountById(id);
  if (!fresh) {
    throw new NotFoundError('Failed to retrieve updated account details');
  }

  console.warn(`[AUDIT] Account Updated: ${id}`);
  return mapAccount(fresh);
}

export async function deleteAccount(id: string, userId: string): Promise<void> {
  const companyId = await getCompanyIdForUser(userId);

  const account = await prisma.account.findFirst({
    where: { id, companyId },
  });
  if (!account) {
    throw new NotFoundError(`Account with ID "${id}" not found`);
  }

  // 1. Transaction check
  const txCount = await prisma.journalEntryItem.count({
    where: { accountId: id },
  });
  if (txCount > 0) {
    throw new BadRequestError('Cannot delete account with existing transactions');
  }

  // 2. Children check
  const childCount = await prisma.account.count({
    where: { parentId: id },
  });
  if (childCount > 0) {
    throw new BadRequestError('Cannot delete parent account with active sub-accounts');
  }

  await prisma.account.delete({
    where: { id },
  });
}

export async function listAccounts(
  userId: string,
  query: AccountQuery,
): Promise<{
  accounts: MappedAccount[];
  meta: ReturnType<typeof buildPaginationMeta>;
}> {
  const companyId = await getCompanyIdForUser(userId);
  const { accounts, meta } = await findAccounts(companyId, query);
  return { accounts: accounts.map(mapAccount), meta };
}

export async function getAccountDetails(id: string, userId: string): Promise<MappedAccount> {
  const companyId = await getCompanyIdForUser(userId);
  const fresh = await findAccountById(id);
  if (fresh?.companyId !== companyId) {
    throw new NotFoundError(`Account with ID "${id}" not found`);
  }
  return mapAccount(fresh);
}
