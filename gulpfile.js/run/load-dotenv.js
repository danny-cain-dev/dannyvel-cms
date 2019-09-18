import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { log, colors } from 'gulp-util';

// Load environment-specific config from .env file into process.env
const filename = path.resolve(__dirname, '..', '..', '.env');

// Not using {silent: true} to ignore missing file because we want to show any other errors
if (fs.existsSync(filename)) {
    dotenv.load({ path: filename });
} else {
    log(colors.yellow("WARNING: .env file doesn't exist"));
}
