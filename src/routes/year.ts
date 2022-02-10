import { Router } from "express";
import { getRepository, Repository } from "typeorm";
import { param } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AcademicYear, Permissions } from "@app/database";
import { asyncRoute, permission } from "@app/utils";
import _ from "lodash";

export function yearRouter(): Router {
	const router = Router();
	const repository: Repository<AcademicYear> = getRepository(AcademicYear);

	router.get(
		"/",
		permission(Permissions.YEAR_GET_ALL),
		asyncRoute(async (req, res) => {
			res.json(await repository.find());
		})
	);

	router.get(
		"/:id",
		permission(Permissions.YEAR_GET_BY_ID),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				res.json(await repository.findOneOrFail(req.params.id));
			}
		})
	);

	router.post(
		"/",
		// TODO: Use checkSchema from express-validator here
		permission(Permissions.YEAR_CREATE),
		asyncRoute(async (req, res) => {})
	);

	router.put(
		"/",
		permission(Permissions.YEAR_UPDATE),
		param("id").isInt(),
		asyncRoute(async (req, res) => {
			if (req.validate()) {
				const academicYear = await repository.findOneOrFail(req.params.id);
				//FIXME: check for whether openingDate is lesser than closureDate and finalClosureDate
				academicYear.name = _.get(req.body, "name", academicYear.name);
				academicYear.openingDate = _.get(req.body, "openingDate", academicYear.openingDate);
				academicYear.closureDate = _.get(req.body, "closureDate", academicYear.closureDate);
				academicYear.finalClosureDate = _.get(req.body, "finalClosureDate", academicYear.finalClosureDate);

				res.json(await repository.save(academicYear));
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
