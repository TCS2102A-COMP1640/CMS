import { Router } from "express";
import { getRepository, Repository, Raw } from "typeorm";
import { param, checkSchema } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AcademicYear, Permissions } from "@app/database";
import { asyncRoute, permission, throwError, getPagination } from "@app/utils";
import _ from "lodash";

export function yearRouter(): Router {
	const router = Router();
	const repository: Repository<AcademicYear> = getRepository(AcademicYear);

	router.get(
		"/",
		permission(Permissions.YEAR_GET_ALL),
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
				res.json(await repository.find({ skip: page * pageLimit, take: pageLimit }));
			}
		})
	);

	router.get(
		"/:name",
		permission(Permissions.YEAR_GET_BY_NAME),
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
		permission(Permissions.YEAR_CREATE),
		checkSchema({
			name: {
				in: "body",
				exists: true,
				isString: true
			},
			openingDate: {
				in: "body",
				exists: true,
				isISO8601: true
			},
			closureDate: {
				in: "body",
				exists: true,
				isISO8601: true
			},
			finalClosureDate: {
				in: "body",
				exists: true,
				isISO8601: true
			}
		}),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const academicYear = repository.create({
					name: req.body.name,
					openingDate: req.body.openingDate,
					closureDate: req.body.closureDate,
					finalClosureDate: req.body.finalClosureDate
				});
				if (
					academicYear.openingDate < academicYear.closureDate &&
					academicYear.openingDate < academicYear.finalClosureDate &&
					academicYear.closureDate <= academicYear.finalClosureDate
				) {
					res.json(await repository.save(academicYear));
				} else {
					throwError(StatusCodes.BAD_REQUEST, "Invalid year's fields provided");
				}
			}
		})
	);

	router.put(
		"/:id",
		permission(Permissions.YEAR_UPDATE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const academicYear = await repository.findOneOrFail(req.params.id);
				academicYear.name = _.get(req.body, "name", academicYear.name);
				academicYear.openingDate = _.get(req.body, "openingDate", academicYear.openingDate);
				academicYear.closureDate = _.get(req.body, "closureDate", academicYear.closureDate);
				academicYear.finalClosureDate = _.get(req.body, "finalClosureDate", academicYear.finalClosureDate);

				if (
					academicYear.openingDate < academicYear.closureDate &&
					academicYear.openingDate < academicYear.finalClosureDate &&
					academicYear.closureDate <= academicYear.finalClosureDate
				) {
					res.json(await repository.save(academicYear));
				} else {
					throwError(StatusCodes.BAD_REQUEST, "Invalid year's fields provided");
				}
			}
		})
	);

	router.delete(
		"/:id",
		permission(Permissions.YEAR_DELETE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			await repository.delete(req.params.id);
			res.status(StatusCodes.OK).send(ReasonPhrases.OK);
		})
	);

	return router;
}
