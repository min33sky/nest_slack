import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorators';
import { Users } from 'src/entities/Users';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@ApiTags('WORKSPACE')
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @ApiOperation({ summary: '내 워크스페이스 가져오기' })
  @Get()
  async getMyWorkspaces(@User() user: Users) {
    return this.workspacesService.findByWorkspaces(user.id);
  }

  @ApiOperation({ summary: '워크스페이스 만들기' })
  @Post()
  async createWorkspaces(
    @User() user: Users,
    @Body() body: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(body.name, body.url, user.id);
  }

  @ApiOperation({ summary: '워크스페이스 멤버 가져오기' })
  @Get(':url/members')
  getAllMembersFromWorkspace(@Param('url') url: string) {
    return this.workspacesService.getWorkspaceMembers(url);
  }

  @ApiOperation({ summary: '워크스페이스 멤버 초대하기' })
  @Post(':url/members')
  async createWorkspaceMembers(
    @Param('url') url: string,
    @Body('email') email: string, // TODO: DTO로 만들자
  ) {
    return this.workspacesService.createWorkspaceMembers(url, email);
  }

  @ApiOperation({ summary: '워크스페이스 특정멤버 가져오기' })
  @Get(':url/members/:id')
  async getWorkspaceMember(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.workspacesService.getWorkspaceMember(url, id);
  }

  // @Get(':url/members/:id')
  // getMemberInfoInWorkspace() {}

  // //? API 설계를 잘못했을 때 코드를 수정하는건 사실상 불가능하다.(이미 사용자가 있을 경우)
  // @Get(':url/users/:id')
  // DEPRECATED_getMemberInfoInWorkspace() {
  //   this.getMemberInfoInWorkspace();
  // }
}
