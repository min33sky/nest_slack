import { PickType } from '@nestjs/swagger';
import { Users } from 'src/entities/Users';

/**
 * User Entity에서 필요한 속성만 뽑아서 DTO 만듦
 */
export class JoinRequestDto extends PickType(Users, [
  'email',
  'nickname',
  'password',
] as const) {}
