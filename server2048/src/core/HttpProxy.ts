import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';

export class HttpProxy {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public setupMiddlewares(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        //支持文件上传
        // const upload = multer();
        // this.app.use(upload.any());

        //设置通用的处理方式，暂时通过控制器自己决定
        // this.setupContentType();
        // this.setupErrorHandling();
    }

    private setupContentType(): void {
        this.app.use((req, res, next) => {
            res.type('application/json');
            next();
        });
    }
}
