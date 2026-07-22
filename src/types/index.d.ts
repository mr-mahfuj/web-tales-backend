import type { AuthenticatedUser } from '../auth.js';
import type { ValidationSchema, Validated } from '../../middleware/validateMiddleware.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthenticatedUser;
        validated?: Validated<ValidationSchema>;
    }
}
