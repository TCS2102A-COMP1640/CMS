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
		checkSchema({
			page: {
				in: "query",
				optional: true,
				isInt: true,
				toInt: true
			},
			pageLimit: {
				in: "query",
				optional: true,
				isInt: true,
				toInt: true
			},
			academicYear: {
				in: "query",
				exists: true,
				custom: {
					options: (value: any) => {
						return repositoryYear.findOneOrFail({ id: _.toInteger(value) });
					}
				}
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const page = Math.max(_.toNumber(_.get(req.query, "page", 0)), 0);
				const pageLimit = Math.max(_.toNumber(_.get(req.query, "pageLimit", 5)), 1);

				const [items, count] = await repositoryIdea
					.createQueryBuilder("idea")
					.leftJoinAndSelect("idea.user", "user")
					.leftJoinAndSelect("idea.categories", "categories")
					.leftJoinAndSelect("idea.comments", "comments")
					.leftJoinAndSelect("idea.documents", "documents")
					.leftJoinAndSelect("idea.reactions", "reactions")
					.leftJoinAndSelect("idea.views", "views")
					.leftJoinAndSelect("user.department", "department")
					.select(["idea.id", "idea.content", "idea.createTimestamp"])
					.addSelect(["user.id"])
					.addSelect(["department.id", "department.name"])
					.addSelect(["categories.id", "categories.name"])
					.addSelect(["reactions.id", "reactions.type"])
					.addSelect(["documents.id", "documents.path"])
					.addSelect(["comments.id", "comments.content"])
					.addSelect(["views.id"])
					.where("idea.academicYear = :academicYearId", { academicYearId: req.query.academicYear })
					.skip(page * pageLimit)
					.take(pageLimit)
					.getManyAndCount();
				res.json({
					pages: Math.ceil(count / pageLimit),
					data: items
				});
			}
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
			academicYear: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return repositoryYear.findOneOrFail({ id: _.toInteger(value) });
					}
				}
			},
			categories: {
				in: "body",
				optional: true,
				custom: {
					options: (value: any) => {
						return _.isArray(value) && _.every(value, _.isInteger);
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
				if (!_.isUndefined(req.user.id)) {
					const categories = await repositoryCategory.findByIds(req.body.categories);
					const idea = repositoryIdea.create({
						content: req.body.content,
						user: {
							id: req.user.id
						},
						academicYear: req.body.academicYear,
						categories
					});
					res.json(await repositoryIdea.save(idea));
				} else {
					res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
				}
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
