import { SetMetadata } from '@nestjs/common';

import { AuditLogAction } from '../../infra/database/schemas/audit-logs.schema';

export interface AuditOptions {
  action: AuditLogAction;
  resource?: string;
  resourceId?: string | ((args: unknown[]) => string);
  metadata?:
    | Record<string, unknown>
    | ((args: unknown[]) => Record<string, unknown>);
}

export const AUDIT_KEY = 'audit';

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);
