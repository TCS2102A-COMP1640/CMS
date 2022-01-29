import { Router, Request, Response } from "express";
import { getRepository, Repository } from "typeorm";
import { body, param, validationResult } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Permission } from "../database";
import { AppConfig } from "../types";
import _ from "lodash";

export function permissionRoute(config: AppConfig): Router {
	const router = Router();
	const repository: Repository<Permission> = getRepository(Permission);

	router.get("/", async (req: Request, res: Response) => {
		try {
			return res.json(await repository.find());
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	router.get("/:id", param("id").isInt(), async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			}

			const permission = await repository.findOne(req.params.id);
			if (_.isNil(permission)) {
				return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
			}

			return res.json(permission);
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	router.post("/", body("name").exists().isString().trim(), async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			}

			const permission = repository.create({
				name: req.body.name
			});

			return res.json(await repository.save(permission));
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

	router.put("/:id", param("id").isInt(), async (req: Request, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
			}

			const permission = await repository.findOne(req.params.id);
			if (_.isNil(permission)) {
				return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
			}

			permission.name = _.get(req.body, "name", permission.name);

			return res.json(await repository.save(permission));
		} catch (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
		}
	});

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
