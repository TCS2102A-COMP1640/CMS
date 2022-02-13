import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { Role, Permissions, User, Roles } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import { param, checkSchema } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { scryptSync, randomBytes } from "crypto";
import _ from "lodash";

function validateAdmin(role?: Role): boolean {
	return role.name === Roles.ADMIN;
}

export function userRouter(): Router {
	const router = Router();
	const repositoryUser: Repository<User> = getRepository(User);
	const repositoryRole: Repository<Role> = getRepository(Role);

	router.get(
		"/",
		permission(Permissions.USER_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(await repositoryUser.find());
		})
	);

	router.get(
		"/:id",
		permission(Permissions.USER_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repositoryUser.findOneOrFail(req.params.id));
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
				isEmail: true,
				normalizeEmail: true
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
				isString: true
			},
			role: {
				in: "body",
				exists: true,
				isString: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const user = await repositoryUser.findOneOrFail({ email: req.body.email }, { relations: ["role"] });
				if (!user) {
					const salt = randomBytes(32).toString("hex");
					const hashedPassword = scryptSync(req.body.password, salt, 64).toString("hex");

					const newUser = repositoryUser.create({
						email: req.body.email,
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						password: `${hashedPassword}$${salt}`,
						role: req.body.role
					});

					res.json(await repositoryUser.save(newUser));
				} else {
					res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
				}
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.USER_UPDATE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const role = await repositoryRole.findOneOrFail(req.params.id);
				if (validateAdmin(role)) {
					const user = await repositoryUser.findOneOrFail(req.params.id);
					if (user) {
						const salt = randomBytes(32).toString("hex");
						const hashedPassword = scryptSync(req.body.password, salt, 64).toString("hex");

						user.email = _.get(req.body, "email", user.email);
						user.firstName = _.get(req.body, "firstName", user.firstName);
						user.lastName = _.get(req.body, "lastName", user.lastName);
						user.password = _.get(req.body, "password", `${hashedPassword}$${salt}`);
						user.role = _.get(req.body, "role", user.role);

						res.json(await repositoryUser.save(user));
					} else {
						res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
					}
				} else {
					res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
				}
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
