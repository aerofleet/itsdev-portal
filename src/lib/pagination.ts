export const PAGE_SIZE = 12;
export function paginateRecords<T>(items: T[], base: string) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const href = (number: number) => number === 1 ? base : `${base}${number}/`;
  return Array.from({ length: totalPages }, (_, index) => ({
    data: items.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE),
    currentPage: index + 1,
    totalPages,
    total: items.length,
    url: { current: href(index + 1), prev: index ? href(index) : undefined, next: index + 1 < totalPages ? href(index + 2) : undefined },
  }));
}
