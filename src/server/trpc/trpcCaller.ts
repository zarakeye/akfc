import { appRouter } from ".";
import { createContext } from ".";


export async function trpcCaller() {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
}