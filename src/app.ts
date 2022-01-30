import express, { Request } from "express";
import expressJwt from "express-jwt";
import morgan from "morgan";
import bodyParser from "body-parser";
import { createConnection } from "typeorm";
import path from "path";
import _ from "lodash";
import { AuthRouter, RoleRouter, PermissionRouter } from "@app/routes";
import { AuthorizationMiddleware, ErrorHandlerMiddleware, UtilitiesMiddleware } from "@app/middlewares";
import { ApplicationConfig } from "@app/interfaces";

const config: ApplicationConfig = {
	serverHost: process.env.SERVER_HOST || "localhost",
	serverPort: _.toNumber(process.env.SERVER_PORT) || 5000,
	serverEnvironment: process.env.SERVER_ENVIRONMENT || "development",
	databaseHost: process.env.DATABASE_HOST || "localhost",
	databasePort: _.toNumber(process.env.DATABASE_PORT) || 5432,
	databaseName: process.env.DATABASE_NAME || "cmsdb",
	databaseUsername: process.env.DATABASE_USERNAME || "postgres",
	databasePassword: process.env.DATABASE_PASSWORD || "postgres",
	jwtSecret: process.env.JWT_SECRET || "4DFFBC3C4864E2F9A8647E79446FA",
	jwtAlgorithm: process.env.JWT_ALGORITHM || "HS256"
};

createConnection({
	type: "postgres",
	host: config.databaseHost,
	port: config.databasePort,
	database: config.databaseName,
	username: config.databaseUsername,
	password: config.databasePassword,
	entities: [path.join(__dirname, "database", "entities", "*.js")],
	synchronize: config.serverEnvironment === "development" ? true : false
}).then(() => {
	const app = express();

	app.config = config;

	app.use(morgan("combined"));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(
		expressJwt({
			secret: config.jwtSecret,
			algorithms: [config.jwtAlgorithm],
			credentialsRequired: false,
			getToken: (req: Request) => {
				let tokenRequest = req.headers.authorization || "";
				if (_.isEmpty(tokenRequest) && _.isString(req.query.token)) {
					tokenRequest = req.query.token;
				}
				const tokenSplit: string[] = tokenRequest.split(" ");
				if (tokenSplit.length === 2 && tokenSplit[0] === "Bearer") {
					return tokenSplit[1];
				}
				return tokenRequest[0];
			}
		})
	);
	app.use(UtilitiesMiddleware);
	app.use(AuthorizationMiddleware);

	app.use("/auth", AuthRouter());
	app.use("/roles", RoleRouter());
	app.use("/permissions", PermissionRouter());

	app.use(ErrorHandlerMiddleware);

	app.listen(config.serverPort, config.serverHost, () => {
		console.log(`Server started on http://${config.serverHost}:${config.serverPort}`);
	});
});
