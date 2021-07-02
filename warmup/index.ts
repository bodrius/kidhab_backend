import { Context } from '@azure/functions';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function(
  context: Context,
  warmupContext: any,
): Promise<void> {
  const client = axios.create({
    baseURL: process.env.BASE_URL,
    timeout: 30000,
  });

  try {
    await client.get('/api/health/uptime');
  } finally {
    context.done();
  }
}
