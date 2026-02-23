export async function withUploadNetworkGuard<T>(work: () => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return work();
  }

  const originalFetch = window.fetch;
  let networkCalls = 0;

  window.fetch = async (...args) => {
    networkCalls += 1;
    console.warn('Local-first guarantee warning: upload triggered network request', args[0]);
    return originalFetch(...args);
  };

  try {
    return await work();
  } finally {
    window.fetch = originalFetch;
    if (networkCalls > 0) {
      console.warn(`Upload operation made ${networkCalls} network request(s).`);
    }
  }
}
