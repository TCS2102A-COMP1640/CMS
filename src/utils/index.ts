import { Roles, User, Permissions } from "@app/database";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { getRepository } from "typeorm";
import _ from "lodash";

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

export function getPagination(req: Request): { page: number; pageLimit: number } {
	const page = Math.max(_.toNumber(_.get(req.query, "page", 0)), 0);
	const pageLimit = Math.max(_.toNumber(_.get(req.query, "pageLimit", 5)), 1);
	return { page, pageLimit };
}

export function permission(value: string) {
	return asyncRoute(async (req: Request, res: Response, next: NextFunction) => {
		if (req.user.role === Roles.GUEST) {
			throwError(StatusCodes.UNAUTHORIZED, "You do not have permission to perform this action");
		}
		if (req.user.role === Roles.ADMIN) {
			next();
			return;
		}
		const user = await getRepository(User).findOne(req.user.id, { relations: ["role", "role.permissions"] });
		const permissions = user.role.permissions;

		if (permissions.findIndex((p) => p.name === Permissions.ALL || p.name === value) != -1) {
			next();
		} else {
			throwError(StatusCodes.UNAUTHORIZED, "You do not have permission to perform this action");
		}
	});
}
