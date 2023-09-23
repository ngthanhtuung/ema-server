import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './../auth.service';
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import User from 'src/main/user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService
    ) {
        super({ passReqToCallback: true })
    }

    /**
     * validate
     * @param req 
     * @param email 
     * @param password 
     * @returns 
     */
    async validate(
        req: Request,
        email: string,
        password: string
    ): Promise<User> {
        // const { role } = req.body as unknown as { role: string };

        const user = await this.authService.validateUser(email, password);
        console.log("user:", user);

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}