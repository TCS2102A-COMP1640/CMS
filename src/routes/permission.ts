import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { param } from "express-validator";
import { Permission, Permissions } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

export function permissionRouter(): Router {
	const router = Router();
	const repository: Repository<Permission> = getRepository(Permission);

	router.get(
		"/",
		permission(Permissions.PERMISSION_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(await repository.find());
		})
	);

	router.get(
		"/:id",
		permission(Permissions.PERMISSION_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.findOneOrFail(req.params.id));
			}
		})
	);

	return router;
}
