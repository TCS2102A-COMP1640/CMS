import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Category, Permissions } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

export function categoryRouter(): Router {
	const router = Router();
	const repository: Repository<Category> = getRepository(Category);

	router.get(
		"/",
		permission(Permissions.CATEGORY_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(await repository.find());
		})
	);

	router.get(
		"/:id",
		permission(Permissions.CATEGORY_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.findOneOrFail(req.params.id));
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.CATEGORY_CREATE),
		body("name").exists().isString(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.save(repository.create({ name: req.body.name })));
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.CATEGORY_UPDATE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const category = await repository.findOneOrFail(req.params.id);

				category.name = _.get(req.body, "name", category.name);

				res.json(await repository.save(category));
			}
		})
	);

	router.delete(
		"/:id",
		permission(Permissions.CATEGORY_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			await repository.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
