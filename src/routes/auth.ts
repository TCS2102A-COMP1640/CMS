import { Router, Request, Response } from "express";
import { AppConfig } from "../types";
import { check, validationResult } from "express-validator/check";

export default function (router: Router, config: AppConfig): Router {
	router.get("/", async (req: Request, res: Response) => {
		try {
			return res.status(200).send("Hello World!");
		} catch (err) {}
	});
	return router;
}
