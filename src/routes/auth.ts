import { Router } from "express";
import { checkSchema } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { asyncRoute, throwError } from "@app/utils";
import { getRepository, Repository } from "typeorm";
import { User } from "@app/database";
import { scryptSync } from "crypto";
import jwt from "jsonwebtoken";
import _ from "lodash";

export function authRouter(): Router {
	const router = Router();
	const repository: Repository<User> = getRepository(User);

	router.get(
		"/",
		asyncRoute(async (req, res) => {
			if (!_.isNil(req.user.id)) {
				res.json(
					_.omit(
						await repository.findOneOrFail({ id: req.user.id }, { relations: ["role", "department"] }),
						"password"
					)
				);
			}
		})
	);

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
				const config = req.app.config;
				const user = await repository.findOneOrFail({ email: req.body.email }, { relations: ["role"] });
				const [hash, salt] = user.password.split("$");
				if (scryptSync(req.body.password, salt, 64).toString("hex") === hash) {
					const token = jwt.sign(
						{
							id: user.id,
							role: user.role.name
						},
						config.jwtSecret,
						{
							algorithm: config.jwtAlgorithm,
							expiresIn: config.jwtExpiresIn
						}
					);
					res.json({ token });
				} else {
					throwError(StatusCodes.UNAUTHORIZED, "Invalid credentials provided");
				}
			}
		})
	);

	return router;
}
