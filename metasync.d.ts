type Callback<T = unknown> = (err: Error | null, data?: T) => void;
type AsyncFunction<T = unknown, R = unknown> = (
  data: T,
  callback: Callback<R>,
) => void;
type AsyncFunctionNoData<R = unknown> = (callback: Callback<R>) => void;
type FlowFunction = AsyncFunction | AsyncFunctionNoData | Flow;

type Flow = FlowFunction[];

export interface Composition {
  (data: unknown, callback?: Callback): Composition;
  (callback: Callback): Composition;
  data?: unknown;
  done?: Callback | null;
  context?: unknown;
  timeout?: number;
  timer?: NodeJS.Timeout | null;
  canceled?: boolean;
  paused?: boolean;
  onResume?: (() => void) | null;
  fns: FlowFunction[];
  parallelize: boolean;
  len: number;
  arrayed: boolean;

  on(name: 'resume', callback: () => void): void;
  finalize(err?: Error): void;
  collect(err: Error | null, result?: unknown): void;
  parallel(): void;
  sequential(): void;
  then(
    fulfill: (result: unknown) => void,
    reject: (err: Error) => void,
  ): Composition;
  clone(): Composition;
  pause(): Composition;
  resume(): Composition;
  timeout(msec: number): Composition;
  cancel(): Composition;
}

export function compose(flow: Flow): Composition;

export class Composition {
  constructor();
}

export function callbackify<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
): (...args: Parameters<T>) => void;

export function asyncify<T extends (...args: unknown[]) => unknown>(
  fn: T,
): (...args: [...Parameters<T>, Callback<ReturnType<T>>]) => void;

export function promiseToCallbackLast<T>(
  promise: Promise<T>,
): (callback: Callback<T>) => void;

export function promisify<T extends (...args: unknown[]) => void>(
  fn: T,
): (
  ...args: Parameters<T> extends [...infer A, Callback<infer R>] ? A : never
) => Promise<R>;

export function promisifySync<T extends (...args: unknown[]) => unknown>(
  fn: T,
): (...args: Parameters<T>) => Promise<ReturnType<T>>;

export interface AsyncMapOptions {
  min?: number;
  percent?: number;
}

export function map<T, R>(
  items: T[],
  fn: (item: T, callback: Callback<R>) => void,
  done: Callback<R[]>,
): void;

export function asyncMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => R,
  options?: AsyncMapOptions | Callback<R[]>,
  done?: Callback<R[]>,
): void;

export function filter<T>(
  items: T[],
  fn: (item: T, callback: Callback<boolean>) => void,
  done: Callback<T[]>,
): void;

export function reduce<T, R>(
  items: T[],
  fn: (
    previous: R,
    current: T,
    callback: Callback<R>,
    counter: number,
    items: T[],
  ) => void,
  done: Callback<R>,
  initial?: R,
): void;

export function reduceRight<T, R>(
  items: T[],
  fn: (
    previous: R,
    current: T,
    callback: Callback<R>,
    counter: number,
    items: T[],
  ) => void,
  done: Callback<R>,
  initial?: R,
): void;

export function each<T>(
  items: T[],
  fn: (item: T, callback: Callback<void>) => void,
  done: Callback<void>,
): void;

export function series<T>(
  items: T[],
  fn: (item: T, callback: Callback<void>) => void,
  done: Callback<T[]>,
): void;

export function find<T>(
  items: T[],
  fn: (item: T, callback: Callback<boolean>) => void,
  done: Callback<T | undefined>,
): void;

export function every<T>(
  items: T[],
  fn: (item: T, callback: Callback<boolean>) => void,
  done: Callback<boolean>,
): void;

export function some<T>(
  items: T[],
  fn: (item: T, callback: Callback<boolean>) => void,
  done: Callback<boolean>,
): void;

export interface Collector {
  expectKeys: Set<string> | null;
  expected: number;
  keys: Set<string>;
  count: number;
  timer: NodeJS.Timeout | null;
  onDone: (err: Error | null, data?: unknown) => void;
  isDistinct: boolean;
  isDone: boolean;
  data: Record<string, unknown>;

  collect(key: string, err: Error | null, value?: unknown): Collector;
  pick(key: string, value: unknown): Collector;
  fail(key: string, err: Error): Collector;
  take(
    key: string,
    fn: (...args: unknown[]) => void,
    ...args: unknown[]
  ): Collector;
  timeout(msec: number): Collector;
  done(callback: (err: Error | null, data?: unknown) => void): Collector;
  finalize(key: Error | null, err?: Error, data?: unknown): Collector;
  distinct(value?: boolean): Collector;
  cancel(err?: Error): Collector;
  then(
    fulfill: (result: unknown) => void,
    reject: (err: Error) => void,
  ): Collector;
}

export function collect(expected: number | string[]): Collector;

export class Collector {
  constructor(expected: number | string[]);
}

export function firstOf(fns: AsyncFunctionNoData[], callback: Callback): void;

export function parallel(
  fns: FlowFunction[],
  context?: unknown,
  callback?: Callback,
): void;
export function parallel(fns: FlowFunction[], callback: Callback): void;

export function sequential(
  fns: FlowFunction[],
  context?: unknown,
  callback?: Callback,
): void;
export function sequential(fns: FlowFunction[], callback: Callback): void;

export function runIf(
  condition: unknown,
  defaultVal: unknown,
  asyncFn: (...args: unknown[]) => void,
  ...args: unknown[]
): void;
export function runIf(
  condition: unknown,
  asyncFn: (...args: unknown[]) => void,
  ...args: unknown[]
): void;

export function runIfFn(
  asyncFn: ((...args: unknown[]) => void) | undefined,
  ...args: unknown[]
): void;

export interface Do {
  prev: Do | null;
  fn: ((...args: unknown[]) => void) | null;
  args: unknown[];
  done: Callback | null;
  next: Do | null;

  (done?: Callback): Do;
  do(fn: (...args: unknown[]) => void, ...args: unknown[]): Do;
  forward(): void;
}

export function doFn(fn: (...args: unknown[]) => void, ...args: unknown[]): Do;

export { doFn as do };

export function toAsync<T extends (...args: unknown[]) => void>(
  fn: T,
): (...argsCb: [...unknown[], Callback]) => void;

export function asAsync<T extends (...args: unknown[]) => void>(
  fn: T,
  ...args: Parameters<T> extends [...infer A, Callback] ? A : never
): (...args: unknown[]) => void & {
  fmap: typeof fmap;
  ap: typeof ap;
  concat: typeof concat;
};

export function of(...args: unknown[]): (...args: unknown[]) => void & {
  fmap: typeof fmap;
  ap: typeof ap;
  concat: typeof concat;
};

export function concat(
  fn1: (...args: unknown[]) => void,
  fn2: (...args: unknown[]) => void,
): (...args: unknown[]) => void;

export function fmap(
  fn1: (...args: unknown[]) => void,
  f: (...args: unknown[]) => unknown,
): (...args: unknown[]) => void;

export function ap(
  fn: (...args: unknown[]) => void,
  funcA: (...args: unknown[]) => void,
): (...args: unknown[]) => void;

export interface MemoizedEvents {
  timeout: ((key: unknown) => void) | null;
  memoize: ((key: unknown, err: Error | null, data?: unknown) => void) | null;
  overflow: ((key: unknown) => void) | null;
  add: ((err: Error | null, data?: unknown) => void) | null;
  del: ((key: unknown) => void) | null;
  clear: (() => void) | null;
}

export interface Memoized extends Function {
  cache: Map<unknown, { err: Error | null; data?: unknown }>;
  timeout: number;
  limit: number;
  size: number;
  maxSize: number;
  maxCount: number;
  events: MemoizedEvents;

  (...args: [...unknown[], Callback]): void;
  clear(): Memoized;
  add(key: unknown, err: Error | null, data?: unknown): Memoized;
  del(key: unknown): Memoized;
  get(key: unknown, callback: Callback): Memoized;
  on(
    eventName: keyof MemoizedEvents,
    listener: (...args: unknown[]) => void,
  ): void;
  emit(eventName: keyof MemoizedEvents, ...args: unknown[]): void;
}

export function memoize<T extends (...args: unknown[]) => void>(
  fn: T,
): Memoized;

export class Memoized {
  constructor();
}

export interface Pool {
  (par?: Callback<unknown> | unknown[]): Pool | unknown;
  items: unknown[];
  delayed: Array<(item: unknown) => void>;
}

export function poolify(
  factory: () => unknown,
  min: number,
  norm: number,
  max: number,
): Pool;

export interface Queue {
  paused: boolean;
  concurrency: number;
  waitTimeout: number;
  processTimeout: number;
  throttleCount: number;
  throttleInterval: number;
  count: number;
  tasks: Array<[unknown, number | string, number]>;
  waiting: Array<Array<[unknown, number | string, number]>>;
  factors: Record<string | number, Array<[unknown, number | string, number]>>;
  fifoMode: boolean;
  roundRobinMode: boolean;
  priorityMode: boolean;
  onProcess: ((item: unknown, callback: Callback) => void) | null;
  onDone: ((err: Error | null, result?: unknown) => void) | null;
  onSuccess: ((item: unknown) => void) | null;
  onTimeout: ((err: Error) => void) | null;
  onFailure: ((err: Error) => void) | null;
  onDrain: (() => void) | null;

  wait(msec: number): Queue;
  throttle(count: number, interval?: number): Queue;
  add(item: unknown, factor?: number | string, priority?: number): Queue;
  next(task: [unknown, number | string, number]): Queue;
  takeNext(): Queue;
  pause(): Queue;
  resume(): Queue;
  clear(): Queue;
  timeout(msec: number, onTimeout?: ((err: Error) => void) | null): Queue;
  process(fn: (item: unknown, callback: Callback) => void): Queue;
  done(fn: (err: Error | null, result?: unknown) => void): Queue;
  success(listener: (item: unknown) => void): Queue;
  failure(listener: (err: Error) => void): Queue;
  drain(listener: () => void): Queue;
  fifo(): Queue;
  lifo(): Queue;
  priority(flag?: boolean): Queue;
  roundRobin(flag?: boolean): Queue;
  pipe(dest: Queue): Queue;
}

export function queue(concurrency: number): Queue;

export class Queue {
  constructor(concurrency: number);
}

export function throttle<T extends (...args: unknown[]) => void>(
  timeout: number,
  fn: T,
  ...args: unknown[]
): (...pars: unknown[]) => void;

export function debounce<T extends (...args: unknown[]) => void>(
  timeout: number,
  fn: T,
  ...args: unknown[]
): () => void;

export function timeout(
  timeout: number,
  fn: (callback: Callback) => void,
  callback: Callback,
): void;

export interface AsyncIteratorResult<T> {
  done: boolean;
  value: T;
}

export interface AsyncIterator<T = unknown> {
  base: Iterator<T> | AsyncIterator<T>;

  [Symbol.asyncIterator](): AsyncIterator<T>;
  next(): Promise<AsyncIteratorResult<T>>;
  count(): Promise<number>;
  each(
    fn: (value: T) => void | Promise<void>,
    thisArg?: unknown,
  ): Promise<void>;
  forEach(
    fn: (value: T) => void | Promise<void>,
    thisArg?: unknown,
  ): Promise<void>;
  parallel(
    fn: (value: T) => unknown | Promise<unknown>,
    thisArg?: unknown,
  ): Promise<unknown[]>;
  every(
    predicate: (value: T) => boolean | Promise<boolean>,
    thisArg?: unknown,
  ): Promise<boolean>;
  find(
    predicate: (value: T) => boolean | Promise<boolean>,
    thisArg?: unknown,
  ): Promise<T | undefined>;
  includes(element: T): Promise<boolean>;
  reduce<R>(
    reducer: (accumulator: R, value: T) => R | Promise<R>,
    initialValue: R,
  ): Promise<R>;
  reduce<R>(reducer: (accumulator: R, value: T) => R | Promise<R>): Promise<R>;
  some(
    predicate: (value: T) => boolean | Promise<boolean>,
    thisArg?: unknown,
  ): Promise<boolean>;
  someCount(
    predicate: (value: T) => boolean | Promise<boolean>,
    count: number,
    thisArg?: unknown,
  ): Promise<boolean>;
  collectTo<C extends new (arr: T[]) => unknown>(
    CollectionClass: C,
  ): Promise<InstanceType<C>>;
  collectWith(
    obj: unknown,
    collector: (obj: unknown, element: T) => void,
  ): Promise<void>;
  join(sep?: string, prefix?: string, suffix?: string): Promise<string>;
  toArray(): Promise<T[]>;
  map<R>(fn: (value: T) => R | Promise<R>, thisArg?: unknown): AsyncIterator<R>;
  filter(
    predicate: (value: T) => boolean | Promise<boolean>,
    thisArg?: unknown,
  ): AsyncIterator<T>;
  flat(depth?: number): AsyncIterator<unknown>;
  flatMap<R>(
    fn: (value: T) => R | Promise<R> | Iterable<R> | AsyncIterable<R>,
    thisArg?: unknown,
  ): AsyncIterator<R>;
  take(count: number): AsyncIterator<T>;
  takeWhile(
    predicate: (value: T) => boolean | Promise<boolean>,
    thisArg?: unknown,
  ): AsyncIterator<T>;
  skip(amount: number): AsyncIterator<T>;
  zip<U extends unknown[]>(
    ...iterators: { [K in keyof U]: Iterable<U[K]> | AsyncIterable<U[K]> }
  ): AsyncIterator<[T, ...U]>;
  chain<U extends unknown[]>(
    ...iterators: { [K in keyof U]: Iterable<U[K]> | AsyncIterable<U[K]> }
  ): AsyncIterator<T | U[number]>;
  enumerate(): AsyncIterator<[number, T]>;
  throttle(percent?: number, min?: number): AsyncIterator<T>;
}

export function asyncIter<T>(
  base: Iterable<T> | AsyncIterable<T>,
): AsyncIterator<T>;

export class AsyncIterator<T = unknown> {
  constructor(base: Iterable<T> | AsyncIterable<T>);
}
