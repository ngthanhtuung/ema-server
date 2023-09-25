import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import User from '../user/user.entity';
import ApiResponse from 'src/shared/res/apiResponse';
import { SharedService } from 'src/shared/shared.service';
import { Payload } from './jwt-auth/payload';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import * as moment from 'moment';
import 'moment-timezone';

@Injectable()
export class AuthService {

    constructor(
        private readonly sharedService: SharedService,
        private readonly userService: UserService,
        private jwtService: JwtService,
    ) { }

    /**
     * validateUser
     * @param email 
     * @param password 
     * @returns 
     */
    async validateUser(email: string, password: string): Promise<User | undefined> {
        const user = await this.userService.findUserByEmail(email);
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
        console.log("login in service");

        const payload: Payload = {
            id: user.id,
            email: user.email,
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

    /**
     * sendCodeByEmail
     * @param email 
     * @returns 
     */
    async sendCodeByEmail(email: string) {
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new HttpException(new ApiResponse('Failed', "User not found"), HttpStatus.NOT_FOUND);
        }
        // generate code
        const code = this.sharedService.generateUniqueRandomNumber();
        // time current
        const currentTime = moment().format("YYYY-MM-DD HH:mm:ss")
        // update code and issueDate
        await this.userService.updateCodeAndIssueDate(user?.id, code, currentTime)
        console.log("code:", code);
        // send code email
        await this.sharedService.sendCodeEmail(email, user.username, code);
        return new ApiResponse('Success', 'Send Code Successfully');
    }
}
