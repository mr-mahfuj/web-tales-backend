import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';

const router = Router();

router.use(
    '/',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'Web Tales API Docs',
    }),
);

export default router;
