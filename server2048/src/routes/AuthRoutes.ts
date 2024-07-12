import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/AuthController';
import { Logger } from '../utils/Logger';

export class AuthRoutes {
    public router: Router;
    private authController: AuthController;
    // private upload: multer.Instance;

    constructor() {
        this.router = Router();
        this.authController = new AuthController();
        // this.upload = multer({ dest: 'uploads/' }); // 配置上传参数
        this.initRoutes();
    }

    private initRoutes(): void {
        // this.router.post('/login', this.upload.single('avatar'), this.authController.login);
        this.router.get('/login', (req, res, next) => {
            this.authController.login(req, res, next);
        });
        this.router.post('/register', multer().none(), this.authController.loginValidations(), this.authController.register.bind(this.authController));
    }
}
