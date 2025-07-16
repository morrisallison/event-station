import Benchmark from "benchmark";
import { test } from "bun:test";

type BenchmarkSuite = {
  on(...args: any[]): BenchmarkSuite;
  add(...args: any[]): BenchmarkSuite;
  run(...args: any[]): BenchmarkSuite;
};

export function runBenchmark(
  title: string,
  setupFn: (suite: BenchmarkSuite) => BenchmarkSuite
): void {
  const completion = Promise.withResolvers<void>();

  let suite = new (Benchmark as any).Suite(title, {
    onAbort: completion.reject,
    onError: completion.reject,
    onComplete: completion.resolve,
  }) as BenchmarkSuite;

  suite = setupFn(suite);

  suite = suite
    .on("cycle", function (event, bench) {
      console.log(event.target.toString());
    })
    .on("complete", function (this: any) {
      console.log("\nFastest is " + this.filter("fastest").map("name"));
    });

  test(
    title,
    async () => {
      suite.run();
      // Asynchronous execution seems to be broken.
      // TODO: Fork Benchmark.js and fix it.
      //   suite.run({ async: true });

      await completion.promise;
    },
    { timeout: 60_000 }
  );
}
