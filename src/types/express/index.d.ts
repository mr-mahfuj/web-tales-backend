import type { AuthenticatedUser } from '../auth.type.js';
import type { ValidationSchema, Validated } from '../../middleware/validate.middleware.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthenticatedUser;
        validated?: Validated<ValidationSchema>;
    }
}
