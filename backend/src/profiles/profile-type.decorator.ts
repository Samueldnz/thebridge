import { SetMetadata } from '@nestjs/common';

export const PROFILE_TYPE_KEY = 'profileType';

export type AllowedProfileType = 'COMPANY' | 'RESEARCHER';

export const ProfileType = (
  profileType: AllowedProfileType,
) => SetMetadata(PROFILE_TYPE_KEY, profileType);