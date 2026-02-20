const fs = require('fs-extra');
const path = require('path');

const ACTIONS_PATH = path.join(__dirname, '../src/app/actions.ts');
const BACKUP_PATH = path.join(__dirname, '../src/app/_actions.backup.ts');

async function restoreOriginal() {
    try {
        if (fs.existsSync(BACKUP_PATH)) {
            // Restore original actions.ts from backup
            // Remove current actions.ts (which is the native copy) first
            if (fs.existsSync(ACTIONS_PATH)) {
                await fs.remove(ACTIONS_PATH);
            }

            await fs.move(BACKUP_PATH, ACTIONS_PATH);
            console.log('Original actions.ts restored from backup');
        } else {
            console.warn('Backup file _actions.backup.ts not found! Cannot restore.');
            // This is critical, we might have lost the original file if something went wrong manually.
            // But if prepare ran correctly, backup exists.
        }
    } catch (err) {
        console.error('Error restoring files:', err);
        process.exit(1);
    }
}

restoreOriginal();
