import { Router } from "express";
import { checkSchema } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { asyncRoute } from "@app/utils";

export function authRouter(): Router {
	const router = Router();
	router.post(
		"/",
		checkSchema({
			email: {
				in: "body",
				exists: true,
				isEmail: true,
				normalizeEmail: true
			},
			password: {
				in: "body",
				exists: true,
				isString: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.status(StatusCodes.OK).send(ReasonPhrases.OK);
			}
		})
	);

	return router;
}
