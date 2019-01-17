declare module 'p-filter' {
  function pFilter<T>(
    iterable: Iterable<T | Promise<T>>,
    filterer: (element: T, index: number) => boolean | Promise<boolean>,
  ): Promise<T[]>;

  export = pFilter;
}
