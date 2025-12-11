import open from 'open';
import chalk from 'chalk';
import ora from 'ora';
import { supabase } from '../utils/db.js';
import { saveConfig } from '../utils/config.js';

export async function login() {
    console.log(chalk.bold('\n🔐 Loophole CLI Login\n'));

    if (!supabase) {
        console.error(chalk.red('Error: Database connection not initialized. Check your environment variables.'));
        process.exit(1);
    }

    const spinner = ora('Initializing login flow...').start();

    try {
        // 1. Create a device request
        const { data: request, error } = await supabase
            .from('device_requests')
            .insert({}) // Defaults generate ID and 'pending' status
            .select()
            .single();

        if (error) throw error;

        const deviceCode = request.device_code;
        // Adjust URL for production later (env var or config)
        const authUrl = `http://localhost:3000/auth/device?code=${deviceCode}`;

        spinner.info(`Device Code: ${chalk.cyan(deviceCode)}`);
        spinner.info(`Opening browser to: ${authUrl}`);

        await open(authUrl);

        spinner.start('Waiting for approval in browser...');

        // 2. Poll for approval
        const pollInterval = 2000; // 2s
        const maxAttempts = 60; // 2 minutes timeout
        let attempts = 0;

        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                spinner.fail('Login timed out.');
                process.exit(1);
            }

            const { data } = await supabase
                .from('device_requests')
                .select('*')
                .eq('device_code', deviceCode)
                .single();

            if (data?.status === 'approved' && data.user_id) {
                // Success!
                // Fetch the user email for display (optional, requires additional permissions or assumptions)
                // For now, just save the ID.
                saveConfig({
                    userId: data.user_id,
                    accessToken: 'session_token_placeholder' // In a full flow we'd exchange for a real JWT if needed for granular RLS
                });

                spinner.succeed(chalk.green(`Success! Logged in as user ID: ${data.user_id}`));
                console.log(chalk.gray('\nYou can now run `loophole start` to create tunnels linked to your account.'));
                process.exit(0);
            } else if (data?.status === 'expired') {
                spinner.fail('Login request expired.');
                process.exit(1);
            } else {
                attempts++;
                setTimeout(checkStatus, pollInterval);
            }
        };

        checkStatus();

    } catch (err) {
        spinner.fail(chalk.red('Login failed: ' + err.message));
        process.exit(1);
    }
}
