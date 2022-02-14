import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Role, Permissions, Roles } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

function validateNotAdminOrGuest(role?: Role): boolean {
	return !(role.name === Roles.ADMIN || role.name === Roles.GUEST);
}

export function roleRouter(): Router {
	const router = Router();
	const repository: Repository<Role> = getRepository(Role);

	router.get(
		"/",
		permission(Permissions.ROLE_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(await repository.find());
		})
	);

	router.get(
		"/:id",
		permission(Permissions.ROLE_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.findOneOrFail(req.params.id));
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.ROLE_CREATE),
		body("name").exists().isString(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.save(repository.create({ name: req.body.name })));
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.ROLE_UPDATE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const role = await repository.findOneOrFail(req.params.id);
				if (!validateNotAdminOrGuest(role)) {
					res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
					return;
				}

				role.name = _.get(req.body, "name", role.name);

				res.json(await repository.save(role));
			}
		})
	);

	router.delete(
		"/:id",
		permission(Permissions.ROLE_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				if (!validateNotAdminOrGuest(await repository.findOneOrFail(req.params.id))) {
					res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
					return;
				}

				await repository.delete(req.params.id);
				res.status(StatusCodes.OK).send(ReasonPhrases.OK);
			}
		})
	);

	return router;
}
