import { JoinRequestDto } from './dto/join.request.dto';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorators';
import { UndefinedToNullInterceptor } from 'src/common/intercepters/undefinedToNull.interceptor';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { LoggedInGuard } from 'src/auth/logged-in-guard';
import { NotLoggedInGuard } from 'src/auth/not-logged-in-guard';
import { Users } from 'src/entities/Users';
import { UsersService } from './users.service';
import { UserDto } from 'src/common/dto/user.dto';
import { LoginResponseDto } from './dto/login.response.dto';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('USER')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCookieAuth('connect.sid')
  @ApiOkResponse({
    type: UserDto, // TODO: 패스워드는 빼자
    description: '성공',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @ApiOperation({
    summary: '내 정보 조회하기',
  })
  @Get()
  getUsers(@User() user: Users) {
    return user || false;
  }

  @UseGuards(NotLoggedInGuard)
  @ApiOperation({
    summary: '회원가입',
  })
  @Post()
  async join(@Body() data: JoinRequestDto) {
    const user = await this.usersService.findByEmail(data.email);

    if (user) throw new UnauthorizedException('이미 존재하는 이메일입니다.');

    const result = await this.usersService.join(
      data.email,
      data.nickname,
      data.password,
    );

    if (result) {
      return 'ok';
    } else {
      throw new ForbiddenException();
    }
  }

  @ApiOkResponse({
    type: LoginResponseDto,
    description: '로그인 성공',
  })
  @ApiOperation({
    summary: '로그인 API',
  })
  @UseGuards(LocalAuthGuard)
  @UseGuards(NotLoggedInGuard)
  @Post('login')
  async login(@User() user: Users) {
    return user;
  }

  @ApiCookieAuth('connect.sid')
  @UseGuards(LoggedInGuard)
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
