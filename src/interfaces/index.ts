import { Algorithm } from "jsonwebtoken";

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
	jwtAlgorithm: Algorithm;
	jwtExpiresIn: string | number;
	saltLength: number;
	keyLength: number;
}

declare module "express-serve-static-core" {
	interface Request extends Express.Request {
		validate(): boolean;
		error?: Error;
	}

	interface Application extends Express.Application {
		config: ApplicationConfig;
	}
}

declare global {
	interface Error {
		statusCode?: number;
	}

	namespace Express {
		interface User {
			id?: number;
			role: string;
		}
	}
}
