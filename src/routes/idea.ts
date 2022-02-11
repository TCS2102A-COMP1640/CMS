import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Idea, Permissions } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

export function ideaRouter(): Router {
	const router = Router();
	const repository: Repository<Idea> = getRepository(Idea);

	router.get(
		"/",
		permission(Permissions.IDEA_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(await repository.find());
		})
	);

	router.get(
		"/:id",
		permission(Permissions.IDEA_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.findOneOrFail(req.params.id));
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.IDEA_CREATE),
		body("content").exists().isString(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.save(repository.create({ content: req.body.content })));
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.IDEA_UPDATE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const idea = await repository.findOneOrFail(req.params.id);
				
				idea.content = _.get(req.body, "content", idea.content);

				res.json(await repository.save(idea));			
			}
		})
	);

	router.delete(
		"/:id",
		permission(Permissions.IDEA_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			await repository.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
