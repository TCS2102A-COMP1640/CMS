import { Router, Request, Response } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param, validationResult } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Role } from "../database";
import { AppConfig } from "../types";
import _ from "lodash";

export function roleRoute(config: AppConfig): Router {
	const router = Router();
	const repository: Repository<Role> = getRepository(Role);

	//Get all
	router.get("/", async (req: Request, res: Response) => {
		try {
			return res.json(await repository.find());
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	//Get by id
	router.get("/:id", param("id").isInt(), async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			}

			const role = await repository.findOne(req.params.id);
			if (_.isNil(role)) {
				return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
			}

			return res.json(role);
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	//Create
	router.post("/", body("name").exists().isString(), async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			}

			const role = repository.create({
				name: req.body.name
			});

			return res.json(await repository.save(role));
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	//Update
	router.put("/:id", param("id").isInt(), async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			}

			const role = await repository.findOne(req.params.id);
			if (_.isNil(role)) {
				return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
			}

			role.name = _.get(req.body, "name", role.name);

			return res.json(await repository.save(role));
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	//Delete
	router.delete("/:id", param("id").isInt(), async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			}

			await repository.delete(req.params.id);

			return res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	return router;
}
