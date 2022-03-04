import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { body, checkSchema, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Department, Permissions } from "@app/database";
import { asyncRoute, permission, getPagination } from "@app/utils";
import _ from "lodash";

export function departmentRouter(): Router {
	const router = Router();
	const repository: Repository<Department> = getRepository(Department);

	router.get(
		"/",
		permission(Permissions.DEPARTMENT_GET_ALL),
		checkSchema({
			page: {
				in: "query",
				optional: true,
				isInt: true
			},
			pageLimit: {
				in: "query",
				optional: true,
				isInt: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const { page, pageLimit } = getPagination(req);
				res.json(await repository.find({ skip: page * pageLimit, take: pageLimit }));
			}
		})
	);

	router.get(
		"/:id",
		permission(Permissions.DEPARTMENT_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.findOneOrFail(req.params.id));
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.DEPARTMENT_CREATE),
		body("name").exists().isString(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.save(repository.create({ name: req.body.name })));
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.DEPARTMENT_UPDATE),
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
		permission(Permissions.DEPARTMENT_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			await repository.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
