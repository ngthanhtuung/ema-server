import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import User from "src/main/user/user.entity";
import { UserService } from "src/main/user/user.service";
import { jwtConstants } from "../constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConstants.accessTokenSecret,
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findUserByUsername(payload.username);
        if (user.refreshToken === null) return null;
        return user;
    }
}