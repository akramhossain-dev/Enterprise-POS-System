import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  supplierDebitNoteQuerySchema,
  createSupplierDebitNoteSchema,
  updateSupplierDebitNoteSchema,
  type SupplierDebitNoteQuery,
  type CreateSupplierDebitNoteBody,
  type UpdateSupplierDebitNoteBody,
} from './supplier-debit-note.schema';
import {
  listSupplierDebitNotes,
  getSupplierDebitNoteById,
  createSupplierDebitNote,
  updateSupplierDebitNote,
  deleteSupplierDebitNote,
} from './supplier-debit-note.service';

export async function handleListSupplierDebitNotes(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery<SupplierDebitNoteQuery>(supplierDebitNoteQuerySchema, request.query);
  const result = await listSupplierDebitNotes(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Debit Notes fetched successfully',
      data: {
        debitNotes: result.debitNotes,
        meta: result.meta,
      },
    }),
  );
}

export async function handleGetSupplierDebitNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const dn = await getSupplierDebitNoteById(id);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Debit Note fetched successfully',
      data: dn,
    }),
  );
}

export async function handleCreateSupplierDebitNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody<CreateSupplierDebitNoteBody>(
    createSupplierDebitNoteSchema,
    request.body,
  );
  const created = await createSupplierDebitNote(body);
  reply.status(201).send(
    sendSuccess({
      message: 'Supplier Debit Note created successfully',
      data: created,
    }),
  );
}

export async function handleUpdateSupplierDebitNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody<UpdateSupplierDebitNoteBody>(
    updateSupplierDebitNoteSchema,
    request.body,
  );
  const updated = await updateSupplierDebitNote(id, body);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Debit Note updated successfully',
      data: updated,
    }),
  );
}

export async function handleDeleteSupplierDebitNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const result = await deleteSupplierDebitNote(id);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Debit Note deleted successfully',
      data: result,
    }),
  );
}
