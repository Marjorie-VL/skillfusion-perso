import { config } from 'dotenv';
import path from 'path';

config({
  path: path.resolve(process.cwd(), 'Back', '.env.test')
});