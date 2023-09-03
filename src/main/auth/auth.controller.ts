import { Controller, Post, UseGuards } from '@nestjs/common';
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


  @Post('/login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login successfully' })
  login(@GetUser() user: User): any {
    return this.authService.login(user);
  }

}
