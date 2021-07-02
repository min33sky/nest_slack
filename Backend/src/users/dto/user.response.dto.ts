import { ApiProperty, PickType } from '@nestjs/swagger';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';

export class UserResponseDto extends PickType(Users, [
  'id',
  'nickname',
  'email',
] as const) {
  @ApiProperty({
    description: '내가 속한 워크스페이스들의 정보를 담은 배열',
  })
  Workspaces: Workspaces[];
}
