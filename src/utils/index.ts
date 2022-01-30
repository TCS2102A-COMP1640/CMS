import { Request, Response, NextFunction } from "express";

export function asyncRoute(func: (req: Request, res: Response) => Promise<any>) {
	return function (req: Request, res: Response, next: NextFunction) {
		Promise.resolve(func.call(this, req, res)).catch(next);
	};
}
