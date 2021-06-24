import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorators';
import { Users } from 'src/entities/Users';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@ApiTags('WORKSPACE')
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  getMyWorkspaces(@User() user: Users) {
    return this.workspacesService.findByWorkspaces(user.id);
  }

  @Post()
  createWorkspaces(@User() user: Users, @Body() body: CreateWorkspaceDto) {
    return this.workspacesService.createWorkspace(body.name, body.url, user.id);
  }

  // @Get(':url/members')
  // getAllMembersFromWorkspace() {}

  // @Post(':url/members')
  // inviteMembersToWorkspace() {}

  // @Delete(':url/members/:id')
  // kickMemberFromWorkspace() {}

  // @Get(':url/members/:id')
  // getMemberInfoInWorkspace() {}

  // //? API 설계를 잘못했을 때 코드를 수정하는건 사실상 불가능하다.(이미 사용자가 있을 경우)
  // @Get(':url/users/:id')
  // DEPRECATED_getMemberInfoInWorkspace() {
  //   this.getMemberInfoInWorkspace();
  // }
}
