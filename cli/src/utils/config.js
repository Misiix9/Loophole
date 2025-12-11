import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.loophole');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function saveConfig(data) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = getConfig();
    const newConfig = { ...current, ...data };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
}

export function getConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

export function clearConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        fs.unlinkSync(CONFIG_FILE);
    }
}
