import { Router, Request, Response } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Role } from "@app/database";
import { asyncRoute } from "@app/utils";
import _ from "lodash";

export default function (): Router {
	const router = Router();
	const repository: Repository<Role> = getRepository(Role);

	//Get all
	router.get(
		"/",
		asyncRoute(async (req: Request, res: Response) => {
			res.json(await repository.find());
		})
	);

	//Get by id
	router.get(
		"/:id",
		param("id").isInt(),
		asyncRoute(async (req: Request, res: Response) => {
			if (req.validate()) {
				const role = await repository.findOne(req.params.id);
				if (_.isNil(role)) {
					res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
					return;
				}

				res.json(role);
			}
		})
	);

	//Create
	router.post(
		"/",
		body("name").exists().isString(),
		asyncRoute(async (req: Request, res: Response) => {
			if (req.validate()) {
				const role = repository.create({
					name: req.body.name
				});

				res.json(await repository.save(role));
			}
		})
	);

	//Update
	router.put(
		"/:id",
		param("id").isInt(),
		asyncRoute(async (req: Request, res: Response) => {
			if (req.validate()) {
				const role = await repository.findOne(req.params.id);
				if (_.isNil(role)) {
					res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
					return;
				}

				role.name = _.get(req.body, "name", role.name);

				res.json(await repository.save(role));
			}
		})
	);

	//Delete
	router.delete(
		"/:id",
		param("id").isInt(),
		asyncRoute(async (req: Request, res: Response) => {
			if (req.validate()) {
				await repository.delete(req.params.id);
				res.status(StatusCodes.OK).send(ReasonPhrases.OK);
			}
		})
	);

	return router;
}
