import { appRouter } from '@/server/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext } from '@/server/trpc';
import type { NextRequest } from 'next/server';

// export const runtime = 'nodejs';

/**
 * Handles an incoming request and returns the response from the
 * appRouter.
 *
 * @param {NextRequest} req The incoming request.
 * @returns {Promise<Response>} The response from the appRouter.
 */
const handler = (req: NextRequest): Promise<Response> =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext
  });

export { handler as GET, handler as POST, handler as OPTIONS, handler as DELETE, handler as PATCH, handler as PUT, handler as HEAD, handler as CONNECT, handler as TRACE };