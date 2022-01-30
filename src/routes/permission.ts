import { Router, Request, Response } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Permission } from "@app/database";
import { asyncRoute } from "@app/utils";
import _ from "lodash";

export default function (): Router {
	const router = Router();
	const repository: Repository<Permission> = getRepository(Permission);

	router.get(
		"/",
		asyncRoute(async (req: Request, res: Response) => {
			res.json(await repository.find());
		})
	);

	router.get(
		"/:id",
		param("id").isInt(),
		asyncRoute(async (req: Request, res: Response) => {
			if (req.validate()) {
				const permission = await repository.findOne(req.params.id);
				if (_.isNil(permission)) {
					res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
					return;
				}

				res.json(permission);
			}
		})
	);

	router.post(
		"/",
		body("name").exists().isString().trim(),
		asyncRoute(async (req: Request, res: Response) => {
			if (req.validate()) {
				const permission = repository.create({
					name: req.body.name
				});
				res.json(await repository.save(permission));
			}
		})
	);

	router.put("/:id", param("id").isInt(), async (req: Request, res: Response) => {
		if (req.validate()) {
			const permission = await repository.findOne(req.params.id);
			if (_.isNil(permission)) {
				res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
				return;
			}

			permission.name = _.get(req.body, "name", permission.name);

			res.json(await repository.save(permission));
		}
	});

	router.delete(
		"/:id",
		param("id").isInt(),
		asyncRoute(async (req: Request, res: Response) => {
			await repository.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
