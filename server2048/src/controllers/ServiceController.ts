import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { Logger } from '../utils/Logger';
import { ConfigLoader } from '../config/config';

export class ServiceController extends BaseController {

    public getConfig(req: Request, res: Response, next: NextFunction) {
        try {
            Logger.info("getConfig req: ", req.body);
            Logger.info("this: ", this);
            const payload = {
                loginURL: `${ConfigLoader.getHttpUrl()}/auth/login}`,
                registerURL: `${ConfigLoader.getHttpUrl()}/auth/register}`,
                websocketURL: ConfigLoader.getWebSocketUrl()
            };
            this.sendSuccess(res, payload, this.getResponseType(req));
        } catch (error) {
            this.handleError(error, req, res, next);
        }
    }

    public test(req: Request, res: Response, next: NextFunction) {
        try {
            Logger.info("test req: ", req.body);
            const payload = { success: true, data: req.body };
            this.sendSuccess(res, payload, this.getResponseType(req));
        } catch (error) {
            this.handleError(error, req, res, next);
        }
    }
}
