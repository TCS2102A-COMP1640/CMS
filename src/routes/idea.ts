import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { checkSchema, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AcademicYear, Idea, Permissions, User, Category } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

export function ideaRouter(): Router {
	const router = Router();
	const repositoryIdea: Repository<Idea> = getRepository(Idea);
	const repositoryUser: Repository<User> = getRepository(User);
	const repositoryYear: Repository<AcademicYear> = getRepository(AcademicYear);
	const repositoryCategory: Repository<Category> = getRepository(Category);

	router.get(
		"/",
		permission(Permissions.IDEA_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(
				await repositoryIdea.find({
					relations: ["user", "comment", "document", "reactions", "views", "academicYear"]
				})
			);
		})
	);

	router.get(
		"/:id",
		permission(Permissions.IDEA_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(
					await repositoryIdea.findOneOrFail(req.params.id, {
						relations: ["user", "comment", "document", "reactions", "views", "academicYear"]
					})
				);
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.IDEA_CREATE),
		checkSchema({
			user: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryUser.findOneOrFail({ id: value });
					}
				}
			},
			academicYear: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryYear.findOneOrFail({ id: value });
					}
				}
			},
			categories: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryCategory.findOneOrFail({ id: value });
					}
				}
			},
			content: {
				in: "body",
				exists: true,
				isString: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const idea = repositoryIdea.create({
					content: req.body.content,
					user: req.body.user,
					academicYear: req.body.academicYear,
					categories: req.body.categories
				});
				res.json(await repositoryIdea.save(idea));
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.IDEA_UPDATE),
		checkSchema({
			id: {
				in: "params",
				isInt: true
			},
			user: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryUser.findOneOrFail({ id: value });
					}
				}
			},
			academicYear: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryYear.findOneOrFail({ id: value });
					}
				}
			},
			categories: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryCategory.findOneOrFail({ id: value });
					}
				}
			},
			content: {
				in: "body",
				exists: true,
				isString: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const idea = await repositoryIdea.findOneOrFail(req.params.id);

				idea.content = _.get(req.body, "content", idea.content);
				idea.user = _.get(req.body, "user", idea.user);
				idea.academicYear = _.get(req.body, "academicYear", idea.academicYear);
				idea.categories = _.get(req.body, "categories", idea.categories);

				res.json(await repositoryIdea.save(idea));
			}
		})
	);

	router.delete(
		"/:id",
		permission(Permissions.IDEA_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			await repositoryIdea.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
