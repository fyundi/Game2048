import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';

export class ServiceRoutes {
    public router: Router;
    private serviceController: ServiceController;
    // private upload: multer.Instance;

    constructor() {
        this.router = Router();
        this.serviceController = new ServiceController();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.get('/config', (req, res, next) => {
            this.serviceController.getConfig(req, res, next);
        });
        this.router.post('/test', (req, res, next) => {
            this.serviceController.test(req, res, next);
        });
    }
}
