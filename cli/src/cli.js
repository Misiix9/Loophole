import { program } from 'commander';
import { start } from './commands/start.js';
import { login } from './commands/login.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

program
    .name('loophole')
    .description('Loophole CLI - Secure localhost tunnels')
    .version(packageJson.version);

program
    .command('start [port]')
    .description('Start a tunnel on the specified port (default: 3000)')
    .option('-s, --subdomain <subdomain>', 'Request a specific subdomain')
    .option('-n, --name <name>', 'Project name')
    .option('--team <slug>', 'Assign to a team')
    .option('--private', 'Make tunnel private')
    .option('-y, --yes', 'Skip confirmation prompts')
    .action((port, options) => {
        start(port || 3000, options);
    });

program
    .command('login')
    .description('Log in to Loophole via browser')
    .action(() => {
        login();
    });

program.parse(process.argv);
