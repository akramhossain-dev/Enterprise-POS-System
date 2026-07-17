import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery } from '../../common/utils/validate';
import {
  supplierCreditNoteQuerySchema,
  createSupplierCreditNoteSchema,
  updateSupplierCreditNoteSchema,
} from './supplier-credit-note.schema';
import {
  listSupplierCreditNotes,
  getSupplierCreditNoteById,
  createSupplierCreditNote,
  updateSupplierCreditNote,
  deleteSupplierCreditNote,
} from './supplier-credit-note.service';

export async function handleListSupplierCreditNotes(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = validateQuery(supplierCreditNoteQuerySchema, request.query);
  const result = await listSupplierCreditNotes(query);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Credit Notes fetched successfully',
      data: {
        creditNotes: result.creditNotes,
        meta: result.meta,
      },
    }),
  );
}

export async function handleGetSupplierCreditNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const cn = await getSupplierCreditNoteById(id);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Credit Note fetched successfully',
      data: cn,
    }),
  );
}

export async function handleCreateSupplierCreditNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const body = validateBody(createSupplierCreditNoteSchema, request.body);
  const created = await createSupplierCreditNote(body);
  reply.status(201).send(
    sendSuccess({
      message: 'Supplier Credit Note created successfully',
      data: created,
    }),
  );
}

export async function handleUpdateSupplierCreditNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const body = validateBody(updateSupplierCreditNoteSchema, request.body);
  const updated = await updateSupplierCreditNote(id, body);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Credit Note updated successfully',
      data: updated,
    }),
  );
}

export async function handleDeleteSupplierCreditNote(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string };
  const result = await deleteSupplierCreditNote(id);
  reply.status(200).send(
    sendSuccess({
      message: 'Supplier Credit Note deleted successfully',
      data: result,
    }),
  );
}
