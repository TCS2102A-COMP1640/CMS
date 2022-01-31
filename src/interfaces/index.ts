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
}

declare module "express-serve-static-core" {
	interface Request extends Express.Request {
		validate(): boolean;
	}

	interface Application extends Express.Application {
		config: ApplicationConfig;
	}
}

declare global {
	namespace Express {
		interface User {
			id?: string;
			role: string;
		}
	}
}
