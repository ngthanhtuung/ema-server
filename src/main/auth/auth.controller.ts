import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './public';
import { LocalAuthGuard } from './local-auth/local-auth.guard';
import LoginDto from './dto/login.dto';
import User from '../user/user.entity';
import { GetUser } from 'src/decorators/getUser.decorator';
import PayloadDTO from './dto/payload.dto';

@Controller('auth')
@ApiTags('auth-controller')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  /**
   * http://localhost:6969/api/v1/login(Post)
   * login
   * @param user 
   * @returns 
   */
  @Post('/login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login successfully' })
  async login(@GetUser() user: User): Promise<any> {
    return this.authService.login(user);
  }

/**
 * 
 * @param account 
 * @returns 
 */
  @Post('/send/code')
  @Public()
  @ApiBody({ type: PayloadDTO })
  @ApiOkResponse({ description: 'Send Code Successfully' })
  async sendCodeByEmail(@Body() account: PayloadDTO): Promise<any | undefined> {
    return await this.authService.sendCodeByEmail(account?.email);
  }

}
