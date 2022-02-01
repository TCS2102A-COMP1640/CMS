import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { Permissions, User } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import { param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import _ from "lodash";

export function userRouter(): Router {
	const router = Router();
	const repository: Repository<User> = getRepository(User);

	router.get(
		"/",
		permission(Permissions.USER_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(await repository.find());
		})
	);

	router.get(
		"/:id",
		permission(Permissions.USER_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.findOneOrFail(req.params.id));
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.USER_CREATE),
		asyncRoute(async (req, res) => {})
	);

	return router;
}
