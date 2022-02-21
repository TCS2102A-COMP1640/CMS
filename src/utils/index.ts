import { Roles, User, Permissions } from "@app/database";
import { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { getRepository } from "typeorm";

export function throwError(statusCode: number, message: string) {
	const error = new Error(message);
	error.statusCode = statusCode;
	throw error;
}

export function asyncRoute(func: (req: Request, res: Response, next?: NextFunction) => Promise<any>) {
	return function (req: Request, res: Response, next: NextFunction) {
		Promise.resolve(func.call(this, req, res, next)).catch(next);
	};
}

export function permission(value: string) {
	return asyncRoute(async (req: Request, res: Response, next: NextFunction) => {
		if (req.user.role === Roles.GUEST) {
			res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
			return;
		}
		if (req.user.role === Roles.ADMIN) {
			next();
			return;
		}
		const user = await getRepository(User).findOne(req.user.id, { relations: ["role"] });
		const permissions = await user.role.permissions;

		if (permissions.findIndex((p) => p.name === Permissions.ALL || p.name === value) != -1) {
			next();
		} else {
			res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
		}
	});
}
