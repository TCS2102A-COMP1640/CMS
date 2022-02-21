import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { body, checkSchema, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AcademicYear, Idea, Permissions, User, Comment, Category, Document } from "@app/database";
import { asyncRoute, permission, throwError } from "@app/utils";
import multer from "multer";
import path from "path";
import _ from "lodash";

const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, callback) => {
			callback(null, "./uploads/");
		},
		filename: (req, file, callback) => {
			callback(null, `${Date.now()}${path.extname(file.originalname)}`);
		}
	}),
	limits: { fileSize: 52428800 }, //50MB
	fileFilter: (req, file, callback) => {
		const fileTypes = /jpeg|jpg|png|pdf|doc/;
		const mimeType = fileTypes.test(file.mimetype);

		const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

		if (mimeType && extName) {
			return callback(null, true);
		}

		callback(new Error(`File upload only supports the following filetypes - ${fileTypes}`));
	}
});

function isYearValid(year: AcademicYear): "valid" | "closure" | "invalid" {
	const currentDate = new Date();
	if (year.openingDate <= currentDate && currentDate <= year.closureDate) {
		return "valid";
	} else if (year.closureDate <= currentDate && currentDate <= year.finalClosureDate) {
		return "closure";
	}
	return "invalid";
}

export function ideaRouter(): Router {
	const router = Router();
	const repositoryIdea: Repository<Idea> = getRepository(Idea);
	const repositoryUser: Repository<User> = getRepository(User);
	const repositoryYear: Repository<AcademicYear> = getRepository(AcademicYear);
	const repositoryCategory: Repository<Category> = getRepository(Category);
	const repositoryDocument: Repository<Document> = getRepository(Document);
	const repositoryComment: Repository<Comment> = getRepository(Comment);

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
					.addSelect(["documents.id", "documents.name", "documents.path"])
					.addSelect(["comments.id", "comments.content", "comments.createTimestamp"])
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
						relations: ["user", "comments", "documents", "reactions", "views", "academicYear", "categories"]
					})
				);
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.IDEA_CREATE),
		upload.array("documents", 5),
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
				notEmpty: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const academicYear = await repositoryYear.findOne({ id: req.body.academicYear });

				if (_.isUndefined(req.user.id) || isYearValid(academicYear) !== "valid") {
					throwError(StatusCodes.BAD_REQUEST, "Invalid year or user ID is undefined");
				}

				const categories = _.isUndefined(req.body.categories)
					? []
					: await repositoryCategory.findByIds(req.body.categories);
				const documents = (req.files as Express.Multer.File[]).map((file) => {
					return repositoryDocument.create({
						name: file.originalname,
						path: file.path
					});
				});
				const idea = repositoryIdea.create({
					content: req.body.content,
					user: {
						id: req.user.id
					},
					academicYear,
					categories,
					documents
				});
				res.json(await repositoryIdea.save(idea));
			}
		})
	);

	router.post(
		"/:id/comments",
		permission(Permissions.IDEA_CREATE_COMMENT),
		param("id").isInt(),
		body("content").notEmpty().exists(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				if (_.isUndefined(req.user.id)) {
					throwError(StatusCodes.BAD_REQUEST, "User ID is undefined");
				}

				const idea = await repositoryIdea.findOneOrFail(req.params.id);
				const comment = repositoryComment.create({
					user: {
						id: req.user.id
					},
					idea,
					content: req.body.content
				});

				res.json(_.pick(await repositoryComment.save(comment), ["id", "content", "createTimestamp"]));
			}
		})
	);

	router.post(
		"/:id/reactions",
		permission(Permissions.IDEA_CREATE_REACTION),
		param("id").isInt(),
		body("type").isInt().exists(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				if (_.isUndefined(req.user.id)) {
					throwError(StatusCodes.BAD_REQUEST, "User ID is undefined");
				}
			}
		})
	);

	router.post(
		"/:id/views",
		permission(Permissions.IDEA_CREATE_VIEW),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				if (_.isUndefined(req.user.id)) {
					throwError(StatusCodes.BAD_REQUEST, "User ID is undefined");
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
