import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import _ from "lodash";

export function utilsMiddleware(req: Request, res: Response, next: NextFunction) {
	req.validate = function () {
		validationResult(this).throw();
		return true;
	};
	next();
}
