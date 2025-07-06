const SIMULATE_DELAY = true;

export async function delay(ms: number) {
  if (SIMULATE_DELAY && process.env.NODE_ENV === 'development') {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
