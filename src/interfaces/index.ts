export interface ApplicationConfig {
	serverHost: string;
	serverPort: number;
	serverEnvironment: string;
	databaseHost: string;
	databasePort: number;
	databaseName: string;
	databaseUsername: string;
	databasePassword: string;
	jwtSecret: string;
	jwtAlgorithm: string;
}

declare module "express-serve-static-core" {
	interface Request extends Express.Request {
		validate(): boolean;
	}

	interface User extends Express.User {
		id?: string;
		role: string;
	}

	interface Application extends Express.Application {
		config: ApplicationConfig;
	}
}
