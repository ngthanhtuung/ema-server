import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import User from '../user/user.entity';
import ApiResponse from 'src/shared/res/apiResponse';
import { SharedService } from 'src/shared/shared.service';
import { Payload } from './jwt-auth/payload';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {

    constructor(
        private readonly sharedService: SharedService,
        private readonly userService: UserService,
        private jwtService: JwtService,
    ) { }

    /**
     * validateUser
     * @param username 
     * @param password 
     * @returns 
     */
    async validateUser(username: string, password: string): Promise<User | undefined> {
        const user = await this.userService.findUserByUsername(username);
        if (!user) {
            throw new HttpException(new ApiResponse('Failed', "User not found"), HttpStatus.NOT_FOUND);
        }
        const isMatch = await this.sharedService.comparePassword(password, user.password);
        if (user.status === false) {
            throw new HttpException(new ApiResponse('Failed', "User is banned, please contact us for assisting!"), HttpStatus.BAD_REQUEST);
        }
        if (user && isMatch && user.status === true) {
            user.password = undefined
            return user;
        }
        throw new HttpException(new ApiResponse('Failed', "Username or Password is invalid"), HttpStatus.BAD_REQUEST);
    }

    /**
     * login
     * @param user 
     * @returns 
     */
    async login(user: User) {
        const payload: Payload = {
            id: user.id,
            username: user.username,
            roles: [user.role.roleName]
        }
        const accessToken = this.jwtService.sign(payload, {
            secret: jwtConstants.accessTokenSecret,
            expiresIn: '3d',
        });
        const refreshToken = this.jwtService.sign(
            { id: payload.id },
            {
                secret: jwtConstants.refreshTokenSecret,
                expiresIn: '60days',
            },
        );
        this.userService.updateRefreshToken(user.id, refreshToken);
        return new ApiResponse('Success', 'Login Successfully', { accessToken: accessToken, refreshToken: refreshToken });
    }
}
