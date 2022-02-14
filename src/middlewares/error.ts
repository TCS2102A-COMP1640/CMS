import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "express-jwt";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { EntityNotFoundError } from "typeorm";

export function errorsMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
    req.error = error;
	if (error instanceof EntityNotFoundError) {
		res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
	} else if (error instanceof UnauthorizedError) {
		res.status(StatusCodes.UNAUTHORIZED).send(ReasonPhrases.UNAUTHORIZED);
	} else {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
	}
	next();
}
