import prisma from './db';

/**
 * Appends an action to the AuditLog table.
 */
export async function logAction(
  action: string,
  userId: string,
  entityType?: string,
  entityId?: string,
  metadata?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Depending on requirements, we might want to throw or just log the error.
    // For now, we just console.error to avoid blocking the main transaction.
  }
}
