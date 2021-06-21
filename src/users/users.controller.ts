import { UserDto } from './../common/dto/user.dto';
import { UsersService } from './users.service';
import { JoinRequestDto } from './dto/join.request.dto';
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({
    type: UserDto,
    description: '성공',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @ApiOperation({
    summary: '내 정보 조회',
  })
  @Get()
  getUsers(@Req() req) {
    return req.user;
  }

  @ApiOperation({
    summary: '회원가입',
  })
  @Post()
  postUsers(@Body() data: JoinRequestDto) {
    this.usersService.postUsers(data.email, data.nickname, data.password);
  }

  @ApiOkResponse({
    type: UserDto,
    description: '성공',
  })
  @ApiOperation({
    summary: '로그인',
  })
  @Post('login')
  login(@Req() req) {
    return req.user;
  }

  @ApiOperation({
    summary: '로그아웃',
  })
  @Post('logout')
  logout(@Req() req, @Res() res) {
    req.logout();
    res.clearCookie('connect.sid', { httpOnly: true });
    res.send('ok');
  }
}
