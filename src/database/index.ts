import { Connection } from "typeorm";
import { Category, setupCategory } from "./entities/category";
import { Comment, setupComment } from "./entities/comment";
import { Department, setupDepartment } from "./entities/department";
import { Idea, setupIdea } from "./entities/idea";
import { Permission, Permissions, setupPermission } from "./entities/permission";
import { Role, Roles, setupRole } from "./entities/role";
import { User, setupUser } from "./entities/user";
import { AcademicYear, setupAcademicYear } from "./entities/year";

export async function setupDatabase(connection: Connection) {
	await setupDepartment(connection);
	await setupCategory(connection);

	await setupPermission(connection);
	await setupRole(connection);

	await setupUser(connection);
}

export { Category, Comment, Department, Idea, Permission, Permissions, Role, Roles, User, AcademicYear };
