import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';
import { HttpHelper } from '../utils/HttpHelper';

export enum ContentType {
    JSON = 'application/json',
    TEXT = 'text/plain',
    HTML = 'text/html',
    FORM_DATA = 'multipart/form-data'
}

export class BaseController {

    // 发送成功响应
    protected sendSuccess(res: Response, data: Object | string, contentType: ContentType = ContentType.JSON): void {
        switch (contentType) {
            case ContentType.JSON:
                res.status(200).json(data);
                break;
            case ContentType.TEXT:
                res.status(200).send(data);
                break;
            // 根据需要可以增加更多的内容类型分支...
            default:
                res.status(200).json(data);
        }
    }

    // 发送错误响应
    protected sendError(res: Response, errorCode: number, message: string): void {
        res.status(errorCode).json({ error: message });
    }

    // 统一错误处理
    protected handleError(err: any, req: Request, res: Response, next: NextFunction) {
        Logger.error('Internal server error:', err);
        this.sendError(res, 500, 'Internal server error');
    }

    protected getResponseType(req: Request) {
        return HttpHelper.determineResponseType(req);
    }

    // 其他通用的响应或错误处理方法可以在这里添加...
}
