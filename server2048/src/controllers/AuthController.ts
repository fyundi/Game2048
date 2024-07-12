import { Request, Response, NextFunction } from 'express';
import { BaseController, ContentType } from './BaseController';
import { Logger } from '../utils/Logger';
import jwt from 'jsonwebtoken';
import { ConfigLoader } from '../config/config';
import { UserModel } from '../models/UserModel';
import { body, validationResult } from 'express-validator';

export class AuthController extends BaseController {

    private userModel: UserModel;

    constructor() {
        super();
        this.userModel = new UserModel();
    }

    public loginValidations() {
        return [
            // 验证用户名和密码是否存在
            body('username').notEmpty().withMessage('Username is required.'),
            body('password').notEmpty().withMessage('Password is required.')
        ];
    }

    private isReqParamValid(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let resp = {
                success: false,
                msg: 'authentication_failed_user_not_found'
            };
            this.sendSuccess(res, resp, this.getResponseType(req));
            return false;
        }
        return true;
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        if (!this.isReqParamValid(req, res, next)) return;
        const { username, password } = req.body;
        try {
            const user = await this.userModel.model.findOne({ username }).exec();
            if (!user) {
                let resp = {
                    success: false,
                    msg: 'authentication_failed_user_not_found'
                };
                this.sendSuccess(res, resp, this.getResponseType(req));
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                let resp = {
                    success: false,
                    msg: 'authentication_failed_wrong_password'
                };
                this.sendSuccess(res, resp, this.getResponseType(req));
            }

            // Ensure your secret key is stored securely and retrieved from environment variable or config
            const jwtSecretKey = ConfigLoader.get("jwtSecretKey");
            const tokenPayload = {
                userId: user._id,
                username: user.username
            };
            const jwtOptions = {
                expiresIn: ConfigLoader.get("jwtExpiresIn")
            };
            const token = jwt.sign(tokenPayload, jwtSecretKey, jwtOptions);

            let resp = {
                success: true,
                token: token
            };
            this.sendSuccess(res, resp, this.getResponseType(req));
        } catch (error) {
            this.handleError(error, req, res, next);
        }
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        if (!this.isReqParamValid(req, res, next)) return;
        const { username, password, nickname } = req.body;
        // 检查用户是否已存在
        if (await this.userModel.model.findOne({ username })) {
            let resp = {
                success: false,
                msg: 'uername_already_exists'
            }
            this.sendSuccess(res, resp, this.getResponseType(req));
        }

        try {
            // 创建新用户记录并保存
            const newUser = await this.userModel.model.create({ username, password, nickname });
            newUser.password = ''; // 确保返回的对象不包括密码字段
            let resp = {
                success: true,
            }
            this.sendSuccess(res, resp, this.getResponseType(req));
        } catch (error) {
            this.handleError(error, req, res, next);
        }
    }
}
