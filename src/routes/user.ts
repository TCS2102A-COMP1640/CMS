import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { Role, Permissions, User, Department } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import { param, checkSchema } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { scryptSync, randomBytes } from "crypto";
import validator from "validator";
import _ from "lodash";

export function userRouter(): Router {
	const router = Router();
	const repositoryUser: Repository<User> = getRepository(User);
	const repositoryRole: Repository<Role> = getRepository(Role);
	const repositoryDepartment: Repository<Department> = getRepository(Department);

	router.get(
		"/",
		permission(Permissions.USER_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(
				_.map(await repositoryUser.find({ relations: ["role", "department"] }), (user) =>
					_.omit(user, "password")
				)
			);
		})
	);

	router.get(
		"/:id",
		permission(Permissions.USER_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(
					_.omit(
						await repositoryUser.findOneOrFail(req.params.id, { relations: ["role", "department"] }),
						"password"
					)
				);
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.USER_CREATE),
		checkSchema({
			email: {
				in: "body",
				exists: true,
				custom: {
					options: async (value: any) => {
						if (!(_.isString(value) && validator.isEmail(value))) {
							return Promise.reject();
						}
						const user = await repositoryUser.findOne({
							email: _.toString(validator.normalizeEmail(value))
						});
						if (user) {
							return Promise.reject();
						}
					}
				}
			},
			firstName: {
				in: "body",
				exists: true,
				isString: true
			},
			lastName: {
				in: "body",
				exists: true,
				isString: true
			},
			password: {
				in: "body",
				exists: true,
				isString: true,
				isStrongPassword: true
			},
			role: {
				in: "body",
				exists: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryRole.findOneOrFail({ id: value });
					}
				}
			},
			department: {
				in: "body",
				optional: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value)
							? Promise.reject()
							: repositoryDepartment.findOneOrFail({ id: value });
					}
				}
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const config = req.app.config;
				const salt = randomBytes(config.saltLength).toString("hex");
				const hashedPassword = scryptSync(req.body.password, salt, config.keyLength).toString("hex");

				const user = repositoryUser.create({
					email: req.body.email,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					password: `${hashedPassword}$${salt}`,
					role: req.body.role,
					department: req.body.department
				});
				res.json(_.omit(await repositoryUser.save(user), "password"));
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.USER_UPDATE),
		checkSchema({
			id: {
				in: "params",
				isInt: true
			},
			email: {
				in: "body",
				optional: true,
				custom: {
					options: async (value: any) => {
						if (!(_.isString(value) && validator.isEmail(value))) {
							return Promise.reject();
						}
						return validator.normalizeEmail(value);
					}
				}
			},
			firstName: {
				in: "body",
				optional: true,
				isString: true
			},
			lastName: {
				in: "body",
				optional: true,
				isString: true
			},
			password: {
				in: "body",
				optional: true,
				isString: true,
				isStrongPassword: true
			},
			role: {
				in: "body",
				optional: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value) ? Promise.reject() : repositoryRole.findOneOrFail({ id: value });
					}
				}
			},
			department: {
				in: "body",
				optional: true,
				custom: {
					options: (value: any) => {
						return !_.isInteger(value)
							? Promise.reject()
							: repositoryDepartment.findOneOrFail({ id: value });
					}
				}
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const user = await repositoryUser.findOneOrFail(req.params.id);

				user.email = _.get(req.body, "email", user.email);
				user.firstName = _.get(req.body, "firstName", user.firstName);
				user.lastName = _.get(req.body, "lastName", user.lastName);
				user.role = _.get(req.body, "role", user.role);
				user.department = _.get(req.body, "department", user.department);

				if (!_.isNil(req.body.password)) {
					const salt = randomBytes(32).toString("hex");
					const hashedPassword = scryptSync(req.body.password, salt, 64).toString("hex");
					user.password = `${hashedPassword}$${salt}`;
				}

				res.json(_.omit(await repositoryUser.save(user), "password"));
			}
		})
	);

	router.delete(
		"/:id",
		permission(Permissions.USER_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			await repositoryUser.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
