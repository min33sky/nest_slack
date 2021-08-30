import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import multer from 'multer';
import path from 'path';
import { User } from 'src/common/decorators/user.decorators';
import { Users } from 'src/entities/Users';
import { DmsService } from './dms.service';

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

@ApiTags('DMS')
@Controller('api/workspaces/:url/dms')
export class DmsController {
  private readonly logger = new Logger(DmsController.name);

  constructor(private dmsService: DmsService) {}

  @ApiOperation({ summary: '워크스페이스 DM 모두 가져오기' })
  @Get()
  async getWorkspaceChannels(@Param('url') url: string, @User() user: Users) {
    this.logger.debug(`${url} 워크스페이스의 DM 모두 가져오기`);
    return this.dmsService.getWorkspaceDMs(url, user.id);
  }

  @ApiOperation({ summary: '워크스페이스 특정 DM 채팅 모두 가져오기' })
  @Get(':id/chats')
  async getWorkspaceDMChats(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Query('page', ParseIntPipe) page: number,
    @User() user: Users,
  ) {
    this.logger.debug(
      `${url} 워크스페이스의 id: ${id}와의 DM 채팅 내역 가져오기`,
    );
    return this.dmsService.getWorkspaceDMChats(url, id, user.id, perPage, page);
  }

  @ApiOperation({ summary: '워크스페이스 특정 DM 채팅 생성하기' })
  @Post(':id/chats')
  async createWorkspaceDMChats(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @User() user: Users,
  ) {
    this.logger.debug(`${url} 워크스페이스 특정 id에게 DM 보내기`);
    return this.dmsService.createWorkspaceDMChats(url, content, id, user.id);
  }

  @ApiOperation({ summary: '워크스페이스 특정 DM 이미지 업로드하기' })
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      storage: multer.diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/');
        },
        filename(req, file, cb) {
          const ext = path.extname(file.originalname);
          cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @Post(':id/images')
  async createWorkspaceDMImages(
    @Param('url') url,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: Users,
  ) {
    this.logger.debug('워크스페이스 특정 DM 이미지 업로드하기');
    return null;
  }

  @ApiOperation({ summary: '안 읽은 개수 가져오기' })
  @Get(':id/unreads')
  async getUnreads(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('after', ParseIntPipe) after: number,
    @User() user: Users,
  ) {
    this.logger.debug('안 읽은 개수 가져오기');
    return null;
  }
}
