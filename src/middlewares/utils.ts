import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import _ from "lodash";

export function utilsMiddleware(req: Request, res: Response, next: NextFunction) {
	req.validate = function () {
		const result = validationResult(this);
		if (!result.isEmpty()) {
			res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			return false;
		}
		return true;
	};
	next();
}
