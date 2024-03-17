import { Config, Context, Effect, Layer, pipe } from "effect";

// Start by defining a type which contains all the necessary properties.
export type ServerConfig = Readonly<{
	port: number;
}>;

// Then create a tag which you will use to require the dependency of the effectful function.
export class ServerConfigCtx extends Context.Tag("ServerConfigCtx")<ServerConfigCtx, ServerConfig>() {}

// Define a private function for reading the necessary parameters effectfully.
const readServerConfig = pipe(
	Config.all([
		// All the effectful functions should be placed here.
		Config.number("PORT"),
	]),
	Config.nested("SERVER"), // Nest all the previous config effects in kind of a namespace. i.e. `SERVER_PORT`.
);

// Compose the `readServerConfig` to make a Live Layer which will be used in production.
export const ServerConfigCtxLive = Layer.effect(ServerConfigCtx)(
	pipe(
		readServerConfig,
		Config.map(([port]) => ({ port })), // Map all the results of effectful computation into a desired type.
	),
);

// Compose the `readServerConfig` to make a Test Layer which will be used in testing.
export const ServerConfigCtxTest = Layer.effect(ServerConfigCtx)(
	pipe(
		readServerConfig,
		Config.nested("TEST"), // Nest all the effect in a test namespace. i.e. `TEST_SERVER_PORT`.
		Config.map(([port]) => ({ port })),
	),
);

// Now into the more complex example. This time try to understand what's going on by yourself:
export type DatabaseConfig = Readonly<{
	port: number;
	host: string;
	username: string;
	password: string;
	database: string;
}>;

export class DatabaseConfigCtx extends Context.Tag("DatabaseConfigCtx")<DatabaseConfigCtx, DatabaseConfig>() {}

const readDatabaseConfig = pipe(
	Config.all([
		Config.number("PORT"),
		Config.string("HOST"),
		Config.string("USERNAME"),
		Config.string("PASSWORD"),
		Config.string("DATABASE"),
	]),
	Config.nested("DATABASE"),
);

export const DatabaseConfigCtxLive = Layer.effect(DatabaseConfigCtx)(
	pipe(
		readDatabaseConfig,
		Config.map(([port, host, username, password, database]) => ({ port, host, username, password, database })),
	),
);

export const DatabaseConfigCtxTest = Layer.effect(DatabaseConfigCtx)(
	pipe(
		readDatabaseConfig,
		Config.nested("TEST"),
		Config.map(([port, host, username, password, database]) => ({ port, host, username, password, database })),
	),
);
// Got it?

// Next we will make the mother of all configs.
export type MainConfig = Readonly<{
	server: ServerConfig;
	database: DatabaseConfig;
}>;

export class MainConfigCtx extends Context.Tag("MainConfigCtx")<MainConfigCtx, MainConfig>() {}

const readMainConfig = pipe(
	Effect.all([ServerConfigCtx, DatabaseConfigCtx]), // Notice how everything composes nicely.
	Effect.map(([server, database]) => ({ server, database })),
);

export const MainConfigCtxLive = pipe(
	Layer.effect(MainConfigCtx)(readMainConfig),
	Layer.provideMerge(ServerConfigCtxLive),
	Layer.provideMerge(DatabaseConfigCtxLive),
);

export const MainConfigCtxTest = pipe(
	Layer.effect(MainConfigCtx)(readMainConfig),
	Layer.provideMerge(ServerConfigCtxTest),
	Layer.provideMerge(DatabaseConfigCtxTest),
);
