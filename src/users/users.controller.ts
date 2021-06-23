import { UserDto } from './../common/dto/user.dto';
import { UsersService } from './users.service';
import { JoinRequestDto } from './dto/join.request.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorators';
import { UndefinedToNullInterceptor } from 'src/common/intercepters/undefinedToNull.interceptor';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('USER')
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
  getUsers(@User() user) {
    return user;
  }

  @ApiOperation({
    summary: '회원가입',
  })
  @Post()
  async join(@Body() data: JoinRequestDto) {
    await this.usersService.join(data.email, data.nickname, data.password);
  }

  @ApiOkResponse({
    type: UserDto,
    description: '성공',
  })
  @ApiOperation({
    summary: '로그인',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@User() user) {
    return user;
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
