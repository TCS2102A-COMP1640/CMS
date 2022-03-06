import { Router } from "express";
import { getRepository, Repository, Raw } from "typeorm";
import { checkSchema, param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { Role, Permissions, Roles, Permission } from "@app/database";
import { asyncRoute, permission, throwError, getPagination } from "@app/utils";
import _ from "lodash";

function validateNotAdminOrGuest(role?: Role): boolean {
	return !(role.name === Roles.ADMIN || role.name === Roles.GUEST);
}

export function roleRouter(): Router {
	const router = Router();
	const repository: Repository<Role> = getRepository(Role);
	const repositoryPermission: Repository<Permission> = getRepository(Permission);

	router.get(
		"/",
		permission(Permissions.ROLE_GET_ALL),
		checkSchema({
			page: {
				in: "query",
				optional: true,
				isInt: true
			},
			pageLimit: {
				in: "query",
				optional: true,
				isInt: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const { page, pageLimit } = getPagination(req);
				res.json(
					await repository.find({ skip: page * pageLimit, take: pageLimit, relations: ["permissions"] })
				);
			}
		})
	);

	router.get(
		"/:name",
		permission(Permissions.ROLE_GET_BY_NAME),
		param("name").isString(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(
					await repository.find({
						where: { name: Raw((alias) => `LOWER(${alias}) LIKE '%${req.params.name.toLowerCase()}%'`) }
					})
				);
			}
		})
	);

	router.post(
		"/",
		permission(Permissions.ROLE_CREATE),
		checkSchema({
			name: {
				in: "body",
				exists: true,
				isString: true
			},
			permissions: {
				in: "body",
				optional: true,
				custom: {
					options: (value: any) => {
						return _.isArray(value) && _.every(value, _.isInteger);
					}
				}
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const permissions = _.isUndefined(req.body.permissions)
					? []
					: await repositoryPermission.findByIds(req.body.permissions);
				res.json(await repository.save(repository.create({ name: req.body.name, permissions })));
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.ROLE_UPDATE),
		checkSchema({
			id: {
				in: "params",
				isInt: true
			},
			permissions: {
				in: "body",
				optional: true,
				custom: {
					options: (value: any) => {
						return _.isArray(value) && _.every(value, _.isInteger);
					}
				}
			}
		}),

		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const role = await repository.findOneOrFail(req.params.id);
				if (!validateNotAdminOrGuest(role)) {
					throwError(StatusCodes.BAD_REQUEST, "Cannot edit default roles such as guest or admin");
				}
				const permissions = _.isUndefined(req.body.permissions)
					? role.permissions
					: await repositoryPermission.findByIds(req.body.permissions);

				role.name = _.get(req.body, "name", role.name);
				role.permissions = permissions;

				res.json(await repository.save(role));
			}
		})
	);

	router.delete(
		"/:id",
		permission(Permissions.ROLE_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				if (!validateNotAdminOrGuest(await repository.findOneOrFail(req.params.id))) {
					throwError(StatusCodes.BAD_REQUEST, "Cannot delete default roles such as guest or admin");
				}

				await repository.delete(req.params.id);
				res.status(StatusCodes.OK).send(ReasonPhrases.OK);
			}
		})
	);

	return router;
}
