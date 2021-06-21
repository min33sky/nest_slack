import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

@ApiTags('Channels')
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  @Get()
  getAllChannels() {}

  @Post()
  createChannel() {}

  @Get(':name')
  getSpecificChannel() {}

  @Get(':name/chats')
  getChats(@Query() query, @Param() param) {
    console.log(query.perPage, query.page);
    console.log(param.name, param.url);
  }

  @Post(':name/chat')
  postChat(@Body() body) {
    return;
  }

  @Get(':name/members')
  getAllMembers() {}

  @Post(':name/members')
  inviteMembers() {}
}
