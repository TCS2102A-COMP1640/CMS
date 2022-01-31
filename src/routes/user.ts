import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { User } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

export function userRouter(): Router {
	const router = Router();
	const repository: Repository<User> = getRepository(User);

	//Get all
	router.get(
		"/",
		permission("roles.get.all"),
		asyncRoute(async (req, res) => {
			res.json(await repository.find());
		})
	);

	return router;
}
