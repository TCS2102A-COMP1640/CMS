import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Permission, Permissions } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

function validateNotAllPermission(permission: Permission): boolean {
	return !(permission.name === Permissions.ALL);
}

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
				const permission = await repository.findOneOrFail(req.params.id);
				res.json(permission);
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.PERMISSION_CREATE),
		body("name").exists().isString().trim(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const permission = repository.create({
					name: req.body.name
				});
				res.json(await repository.save(permission));
			}
		})
	);

	router.put("/:id", permission(Permissions.PERMISSION_UPDATE), param("id").isInt(), async (req, res) => {
		if (req.validate()) {
			const permission = await repository.findOneOrFail(req.params.id);
			if (!validateNotAllPermission(permission)) {
				res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
				return;
			}

			permission.name = _.get(req.body, "name", permission.name);

			res.json(await repository.save(permission));
		}
	});

	router.delete(
		"/:id",
		permission(Permissions.PERMISSION_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (!validateNotAllPermission(await repository.findOneOrFail(req.params.id))) {
				res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
				return;
			}
			await repository.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
