import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Get, Post } from '@nestjs/common';

@ApiTags('Workspaces')
@Controller('api/workspaces')
export class WorkspacesController {
  @Get()
  getMyWorkspaces() {}

  @Post()
  createWorkspaces() {}

  @Get(':url/members')
  getAllMembersFromWorkspace() {}

  @Post(':url/members')
  inviteMembersToWorkspace() {}

  @Delete(':url/members/:id')
  kickMemberFromWorkspace() {}

  @Get(':url/members/:id')
  getMemberInfoInWorkspace() {}

  //? API 설계를 잘못했을 때 코드를 수정하는건 사실상 불가능하다.(이미 사용자가 있을 경우)
  @Get(':url/users/:id')
  DEPRECATED_getMemberInfoInWorkspace() {
    this.getMemberInfoInWorkspace();
  }
}
