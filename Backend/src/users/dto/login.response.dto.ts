import { PickType } from '@nestjs/swagger';
import { Users } from 'src/entities/Users';

export class LoginResponseDto extends PickType(Users, [
  'id',
  'email',
] as const) {}
