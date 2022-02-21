import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "express-jwt";
import { TypeORMError } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { unlink } from "fs";
import _ from "lodash";

export function errorsMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
	if (error instanceof UnauthorizedError) {
		(error as Error).statusCode = StatusCodes.UNAUTHORIZED;
	}
	if (error instanceof TypeORMError || _.has(error, "errors")) {
		(error as Error).statusCode = StatusCodes.BAD_REQUEST;
	}

	req.error = error;

	switch (error.statusCode) {
		case StatusCodes.UNAUTHORIZED:
			res.status(StatusCodes.UNAUTHORIZED);
			break;
		case StatusCodes.BAD_REQUEST:
			res.status(StatusCodes.BAD_REQUEST);
			break;
		case StatusCodes.NOT_FOUND:
			res.status(StatusCodes.NOT_FOUND);
			break;
		default:
			res.status(StatusCodes.INTERNAL_SERVER_ERROR);
			break;
	}

	if (!_.isUndefined(req.file)) {
		unlink(req.file.path, (error) => {
			if (!error) {
				console.log(`Delete file: ${req.file.path}`);
			}
		});
	}
	if (!_.isUndefined(req.files)) {
		(req.files as Express.Multer.File[]).forEach((file: Express.Multer.File) => {
			unlink(file.path, (error) => {
				if (!error) {
					console.log(`Delete file: ${file.path}`);
				}
			});
		});
	}

	res.json({ message: _.has(error, "errors") ? (_.first(_.get(error, "errors")) as any).msg : error.message });

	next();
}
