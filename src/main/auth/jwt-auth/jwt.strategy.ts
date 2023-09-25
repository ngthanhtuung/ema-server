import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";
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

    /**
     * validate
     * @param payload 
     * @returns 
     */
    async validate(payload: any) {
        const user = await this.userService.findUserByEmail(payload.email);
        if (user.refreshToken === null) return null;
        return user;
    }
}