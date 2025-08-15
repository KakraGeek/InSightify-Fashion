// Mock context utility for Blitz.js resolvers in API routes
export const createMockContext = (sessionData: any = {}) => ({
  session: {
    userId: "cmeczuj150002yvqwmik8ecmq", // Real user ID from database
    workspaceId: "cmeczuiuq0000yvqwnrr50qdd", // Real workspace ID from database
    ...sessionData,
  } as any,
  prefetchQuery: () => Promise.resolve(),
  prefetchInfiniteQuery: () => Promise.resolve(),
  // Add other required properties as needed
  $publicData: {},
  $handle: {},
  $authorize: () => Promise.resolve(),
  $isAuthorized: () => Promise.resolve(),
  $revoke: () => Promise.resolve(),
  $revalidate: () => Promise.resolve(),
  $setPublicData: () => Promise.resolve(),
  $getPublicData: () => Promise.resolve(),
  $setPrivateData: () => Promise.resolve(),
  $getPrivateData: () => Promise.resolve(),
} as any)
