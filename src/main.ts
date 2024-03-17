import { Effect, pipe } from "effect";
import "dotenv/config";

import { DatabaseConfigCtx, MainConfigCtx, MainConfigCtxLive, ServerConfigCtx } from "./config";

const Server = Effect.gen(function* (_) {
	const config = yield* _(ServerConfigCtx);
	yield* _(Effect.logInfo(`Server port: ${config.port}`));
});

const Database = Effect.gen(function* (_) {
	const config = yield* _(DatabaseConfigCtx);
	yield* _(Effect.logInfo(`Database port: ${config.port}`));
});

const Main = Effect.gen(function* (_) {
	const config = yield* _(MainConfigCtx);
	yield* _(Server);
	yield* _(Database);
	yield* _(Effect.logInfo(`Main configuration: ${JSON.stringify(config)}`));
});

pipe(
	Effect.provide(Main, MainConfigCtxLive), // Provide all the dependencies.
	Effect.runSync, // Run synchronously.
);
