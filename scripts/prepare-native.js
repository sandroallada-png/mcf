const fs = require('fs-extra');
const path = require('path');

const ACTIONS_PATH = path.join(__dirname, '../src/app/actions.ts');
const NATIVE_ACTIONS_PATH = path.join(__dirname, '../src/app/actions.native.ts');
const BACKUP_PATH = path.join(__dirname, '../src/app/_actions.backup.ts');

async function swapForNative() {
    try {
        if (fs.existsSync(BACKUP_PATH)) {
            console.warn('Backup file _actions.backup.ts ALREADY EXISTS. Aborting swap to prevent overwriting original backup.');
            console.warn('Run restore-native.js first or manually check the files.');
            process.exit(1);
        }

        if (fs.existsSync(ACTIONS_PATH)) {
            // Backup original actions.ts
            await fs.move(ACTIONS_PATH, BACKUP_PATH, { overwrite: false });
            console.log('Original actions.ts backed up to _actions.backup.ts');

            // Copy native actions to actions.ts
            await fs.copy(NATIVE_ACTIONS_PATH, ACTIONS_PATH);
            console.log('Native actions stub copied to actions.ts');
        } else {
            console.warn('actions.ts not found!');
        }
    } catch (err) {
        console.error('Error swapping files:', err);
        process.exit(1);
    }
}

swapForNative();
