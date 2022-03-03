import { Entity, PrimaryGeneratedColumn, Column, Connection, Repository } from "typeorm";

@Entity()
export class Permission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;
}

export enum Permissions {
	ALL = "*",
	USER_GET_ALL = "user.get.all",
	USER_GET_BY_ID = "user.get.id",
	USER_CREATE = "user.create",
	USER_UPDATE = "user.update",
	USER_DELETE = "user.delete",
	ROLE_GET_ALL = "role.get.all",
	ROLE_GET_BY_ID = "role.get.id",
	ROLE_CREATE = "role.create",
	ROLE_UPDATE = "role.update",
	ROLE_DELETE = "role.delete",
	PERMISSION_GET_ALL = "permission.get.all",
	PERMISSION_GET_BY_ID = "permission.get.id",
	YEAR_GET_ALL = "year.get.all",
	YEAR_GET_BY_ID = "year.get.id",
	YEAR_CREATE = "year.create",
	YEAR_UPDATE = "year.update",
	YEAR_DELETE = "year.delete",
	IDEA_GET_ALL = "idea.get.all",
	IDEA_GET_ALL_COMMENT = "idea.get.all.comment",
	IDEA_GET_ALL_VIEW = "idea.get.all.view",
	IDEA_GET_ALL_CSV = "idea.get.all.csv",
	IDEA_GET_ALL_DOCUMENTS = "idea.get.all.documents",
	IDEA_GET_REACTION = "idea.get.reaction",
	IDEA_GET_BY_ID = "idea.get.id",
	IDEA_CREATE = "idea.create",
	IDEA_CREATE_COMMENT = "idea.create.comment",
	IDEA_CREATE_REACTION = "idea.create.reaction",
	IDEA_CREATE_VIEW = "idea.create.view",
	CATEGORY_GET_ALL = "category.get.all",
	CATEGORY_GET_BY_ID = "category.get.id",
	CATEGORY_CREATE = "category.create",
	CATEGORY_UPDATE = "category.update",
	CATEGORY_DELETE = "category.delete",
	DEPARTMENT_GET_ALL = "department.get.all",
	DEPARTMENT_GET_BY_ID = "department.get.id",
	DEPARTMENT_CREATE = "department.create",
	DEPARTMENT_UPDATE = "department.update",
	DEPARTMENT_DELETE = "department.delete"
}

export async function setupPermission(connection: Connection) {
	const repository: Repository<Permission> = connection.getRepository(Permission);
	const permissions = Object.values(Permissions).map((permission) => {
		return {
			name: permission
		};
	});
	await repository.createQueryBuilder().insert().values(permissions).orIgnore().execute();
}
