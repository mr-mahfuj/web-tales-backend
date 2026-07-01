import app from './app.js';
import { env } from './config/env.js';

void app.listen(env.port, () => {
    process.stdout.write(`Server running on port ${env.port}\n`);
});
