import { Router, Request, Response } from "express";
import { AppConfig } from "../types";

export function authRoute(config: AppConfig): Router {
	const router = Router();

	router.get("/", async (req: Request, res: Response) => {
		try {
			return res.status(200).send("Hello World!");
		} catch (err) {
			return res.status(404);
		}
	});
	return router;
}
