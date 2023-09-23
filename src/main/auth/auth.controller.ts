import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './public';
import { LocalAuthGuard } from './local-auth/local-auth.guard';
import LoginDto from './dto/login.dto';
import User from '../user/user.entity';
import { GetUser } from 'src/decorators/getUser.decorator';

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
    console.log("tesst login");
    return this.authService.login(user);
  }

  /**
   * 
   */
  @Post('/send/code')
  @Public()
  async sendCodeByEmail(@Body() email: string): Promise<any | undefined> {
    return await this.authService.sendCodeByEmail(email);
  }

}
