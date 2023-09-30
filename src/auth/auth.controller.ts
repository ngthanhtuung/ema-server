import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { ERole } from 'src/common/enum/enum';
import { GetUser } from 'src/decorators/getUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { AccountCreateRequest } from 'src/modules/account/dto/account.request';

@ApiBearerAuth()
@Controller('auth')
@ApiTags('auth-controller')
export class AuthenticationController {
  constructor(private readonly authService: AuthService) {}

  /**
   * http://localhost:6969/api/v1/login(Post)
   * login
   * @param user
   * @returns
   */
  @Post('/login')
  @Public()
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login successfully' })
  async login(@Body() data: LoginDto): Promise<any> {
    return this.authService.login(data.email, data.password);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() accountRequest: AccountCreateRequest) {
    return await this.authService.signUp(accountRequest);
  }

  @Roles(ERole.EMPLOYEE, ERole.ADMIN)
  @Get('me')
  async getMe(@GetUser() user) {
    return JSON.parse(user);
  }
}
