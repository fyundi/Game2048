import { Request, Response } from 'express';
import { Logger } from './Logger';
import { ContentType } from '../controllers/BaseController';

export class HttpHelper {

    public static determineResponseType(req: Request): ContentType {
        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes(ContentType.JSON)) {
            return ContentType.JSON;
        } else if (acceptHeader.includes(ContentType.TEXT) || req.is(ContentType.TEXT)) {
            return ContentType.TEXT;
        }
        // ...根据需要检测其他类型...
        return ContentType.JSON; // 默认返回JSON
    }
}
