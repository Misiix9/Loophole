import localtunnel from 'localtunnel';
import chalk from 'chalk';
import boxen from 'boxen';
import readline from 'readline';
import { supabase } from '../utils/db.js';
import { getConfig } from '../utils/config.js';

export async function start(port, options) {
    const targetPort = parseInt(port, 10);
    const config = getConfig();
    const userId = config.userId;

    // Safety Warning for Public Tunnels
    if (!options.private && !options.yes) {
        console.log(chalk.red.bold('\n⚠️  SECURITY WARNING: You are starting a PUBLIC tunnel.'));
        console.log(chalk.red('Anyone with the URL can access this port on your machine.'));
        console.log(chalk.gray('Use --private to make it private, or --yes to suppress this warning.\n'));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question(chalk.bold('Are you sure you want to proceed? (y/N) '), resolve);
        });

        rl.close();

        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log(chalk.gray('Aborting.'));
            process.exit(0);
        }
    }

    console.log(chalk.blue(`Starting tunnel on port ${targetPort}...`));

    // Safety Warning for Public Tunnels
    if (!options.private && !options.yes) {
        console.log(chalk.red.bold('\n⚠️  SECURITY WARNING: You are starting a PUBLIC tunnel.'));
        console.log(chalk.red('Anyone with the URL can access this port on your machine.'));
        console.log(chalk.gray('Use --private to make it private, or --yes to suppress this warning.\n'));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question(chalk.bold('Are you sure you want to proceed? (y/N) '), resolve);
        });

        rl.close();

        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log(chalk.gray('Aborting.'));
            process.exit(0);
        }
    }

    try {
        const tunnel = await localtunnel({
            port: targetPort,
            subdomain: options.subdomain
        });

        // Loophole branding
        const emerald = chalk.hex('#10B981');
        let dbStatus = '';
        let tunnelId = null;

        if (supabase) {
            let userToUse = userId;
            let statusMessage = '';

            if (!userId) {
                userToUse = '00000000-0000-0000-0000-000000000000'; // Fallback Mock
                statusMessage = chalk.yellow('(Anonymous / Not Logged In)');
                // ... (keep authenticated logic)
            } else {
                statusMessage = emerald('(Authenticated)');
            }

            // Resolve Team if requested
            let teamId = null;
            if (options.team) {
                const { data: teamData, error: teamError } = await supabase
                    .from('teams')
                    .select('id, name')
                    .eq('slug', options.team)
                    .single();

                if (teamError || !teamData) {
                    console.log(chalk.yellow(`\n⚠️  Warning: Team with slug '${options.team}' not found. Starting as personal tunnel.`));
                } else {
                    teamId = teamData.id;
                    console.log(chalk.blue(`\n👥  Starting in team: ${teamData.name}`));
                }
            }

            // Create initial record
            const { data, error } = await supabase
                .from('tunnels')
                .insert({
                    user_id: userToUse,
                    team_id: teamId,
                    project_name: options.name || `Project ${targetPort}`,
                    current_url: tunnel.url,
                    status: 'online',
                    privacy: options.private ? 'private' : 'public',
                    last_heartbeat: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                dbStatus = chalk.yellow(`(DB Error: ${error.message})`);
            } else {
                tunnelId = data.id;
                dbStatus = statusMessage;
            }
        } else {
            dbStatus = chalk.gray('(Offline Mode: No Credentials)');
        }

        // ... (User ID logic)

        const message = `
${emerald.bold('🟢 Loophole Online')} ${dbStatus}

${chalk.bold('User ID:')}  ${userId ? userId : 'Anonymous'}
${chalk.bold('URL:')}      ${tunnel.url}
${chalk.bold('Port:')}     ${targetPort}
${options.subdomain ? `${chalk.bold('Subdomain:')} ${options.subdomain}` : ''}
`;

        console.log(boxen(message.trim(), {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: '#10B981',
            title: 'Loophole',
            titleAlignment: 'center'
        }));

        if (!userId) {
            console.log(chalk.yellow('Tip: Run `loophole login` to claim this tunnel and see it in your dashboard!'));
        }

        // --- Heartbeat Logic ---
        let heartbeatInterval;
        if (tunnelId && supabase) {
            heartbeatInterval = setInterval(async () => {
                await supabase
                    .from('tunnels')
                    .update({ last_heartbeat: new Date().toISOString() })
                    .eq('id', tunnelId);
            }, 10000); // 10s
        }

        tunnel.on('close', () => {
            console.log(chalk.red('Tunnel connection closed.'));
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        });

        const cleanup = async () => {
            if (tunnelId && supabase) {
                console.log(chalk.gray('\nUpdating status to offline...'));
                await supabase
                    .from('tunnels')
                    .update({ status: 'offline' })
                    .eq('id', tunnelId);
            }
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            try {
                tunnel.close();
            } catch (e) { /* ignore */ }

            console.log(chalk.gray('Goodbye!'));
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (error) {
        console.error(chalk.red('Error starting tunnel:'), error);
        // process.exit(1); // Don't force exit, let natural cleanup happen or user retry
    }
}
