import { AppServer } from './AppServer';

async function main() {
    const server = new AppServer();
    await server.start();
}

main().catch((error) => {
    console.error('Error during application initialization:', error);
});
