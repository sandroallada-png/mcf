/**
 * Script de génération d'icônes Android depuis public/mcf-logo.png
 * Redimensionne l'image vers tous les formats mipmap requis
 * Usage: node scripts/generate-android-icons.js
 */

const fs = require('fs-extra');
const path = require('path');

const SOURCE_ICON = path.join(__dirname, '../public/new-logo/logo-favicon.png');
const ANDROID_RES = path.join(__dirname, '../android/app/src/main/res');

const SIZES = [
    { folder: 'mipmap-ldpi', size: 36 },
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generateIcons() {
    // Vérifier que sharp est disponible
    let sharp;
    try {
        sharp = require('sharp');
    } catch (e) {
        console.log('📦 Installation de sharp...');
        const { execSync } = require('child_process');
        execSync('npm install --save-dev sharp', { stdio: 'inherit' });
        sharp = require('sharp');
    }

    if (!fs.existsSync(SOURCE_ICON)) {
        console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
        process.exit(1);
    }

    console.log(`🎨 Génération des icônes depuis: ${SOURCE_ICON}`);

    for (const { folder, size } of SIZES) {
        const destFolder = path.join(ANDROID_RES, folder);
        await fs.ensureDir(destFolder);

        // 1. ic_launcher.png (Legacy square icon)
        // On remplit avec le vert de la marque si besoin, ou on garde transparent
        await sharp(SOURCE_ICON)
            .trim() // Enlève les bordures de couleur uniforme (ex: blanc si mal découpé)
            .resize(size, size, { 
                fit: 'contain', 
                background: { r: 46, g: 125, b: 50, alpha: 0 } // Transparent padding
            })
            .png()
            .toFile(path.join(destFolder, 'ic_launcher.png'));

        // 2. ic_launcher_round.png (Legacy round icon)
        // On force un cercle parfait sans bords blancs
        const radius = size / 2;
        const circleShape = Buffer.from(
            `<svg><circle cx="${radius}" cy="${radius}" r="${radius}" fill="black"/></svg>`
        );

        await sharp(SOURCE_ICON)
            .resize(size, size, { fit: 'cover' })
            .composite([{
                input: circleShape,
                blend: 'dest-in'
            }])
            .png()
            .toFile(path.join(destFolder, 'ic_launcher_round.png'));

        // 3. ic_launcher_foreground.png (Adaptive layer)
        // L'image doit faire 108/72ème de la taille de l'icône, 
        // avec le logo au centre (environ 60% de la surface pour être "safe")
        const adaptiveSize = Math.round(size * (108 / 72)); // Proportion standard Android
        const logoSize = Math.round(adaptiveSize * 0.65); // Logo occupe 65% pour voir le fond vert autour

        await sharp(SOURCE_ICON)
            .trim()
            .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .extend({
                top: Math.round((adaptiveSize - logoSize) / 2),
                bottom: Math.round((adaptiveSize - logoSize) / 2),
                left: Math.round((adaptiveSize - logoSize) / 2),
                right: Math.round((adaptiveSize - logoSize) / 2),
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .resize(adaptiveSize, adaptiveSize) // Ensure exact size
            .png()
            .toFile(path.join(destFolder, 'ic_launcher_foreground.png'));

        console.log(`  ✓ ${folder} généré`);
    }

    console.log('\n✅ Icônes corrigées et optimisées !');
    console.log('👉 Rebuild l\'APK dans Android Studio pour voir les changements.');
}

generateIcons().catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
});
