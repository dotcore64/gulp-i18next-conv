import { createRequire } from 'module';
import { use } from 'chai';

const require = createRequire(import.meta.url);

use(require('sinon-chai'));
use(require('dirty-chai'));
