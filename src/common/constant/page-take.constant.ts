/** Default paging of every list screen. `take` is the page size the API receives. */
export const PAGE_TAKE_DEFAULT = { page: 1, take: 20 } as const;

/** Page sizes offered by the shared pagination control. */
export const PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 100];
