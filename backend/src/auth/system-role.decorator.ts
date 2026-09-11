import { SetMetadata } from '@nestjs/common';

export type AllowedSystemRole = 'USER' | 'ADMIN';

export const SYSTEM_ROLE_KEY = 'systemRole';

export const SystemRole = (
  systemRole: AllowedSystemRole,
) => SetMetadata(SYSTEM_ROLE_KEY, systemRole);