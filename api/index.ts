import { createApp } from '../src/main';

export default async (req: any, res: any) => {
    const app = await createApp();
    const instance = app.getHttpAdapter().getInstance();
    return instance(req, res);
};