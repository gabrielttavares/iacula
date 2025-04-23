import { notarize } from '@electron/notarize';
import { build } from '../package.json' assert { type: 'json' };

export default async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;
    const appPath = `${appOutDir}/${appName}.app`;

    console.log(`Notarizing ${appPath} with Apple ID ${process.env.APPLE_ID}`);

    try {
        await notarize({
            tool: 'notarytool',
            appPath,
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }

    console.log(`Done notarizing ${appPath}`);
} 