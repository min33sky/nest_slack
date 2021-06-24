import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { User } from 'src/common/decorators/user.decorators';
import { Users } from 'src/entities/Users';

@ApiTags('CHANNELS')
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @ApiOperation({ summary: '워크스페이스 채널 모두 가져오기' })
  @Get()
  async getWorkspaceChannels(@Param('url') url: string, @User() user: Users) {
    return this.channelsService.getWorkspaceChannels(url, user.id);
  }

  @ApiOperation({ summary: '워크스페이스 특정 채널 가져오기' })
  @Get(':name')
  async getWorkspaceChannel(
    @Param('url') url: string,
    @Param('name') name: string,
  ) {
    return this.channelsService.getWorkspaceChannel(url, name);
  }

  // @Get()
  // getAllChannels() {}
  // @Post()
  // createChannel() {}
  // @Get(':name')
  // getSpecificChannel() {}
  // @Get(':name/chats')
  // getChats(@Query() query, @Param() param) {
  //   console.log(query.perPage, query.page);
  //   console.log(param.name, param.url);
  // }
  // @Post(':name/chat')
  // postChat(@Body() body) {
  //   return;
  // }
  // @Get(':name/members')
  // getAllMembers() {}
  // @Post(':name/members')
  // inviteMembers() {}
}
