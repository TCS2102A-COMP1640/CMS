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
	PERMISSION_CREATE = "permission.create",
	PERMISSION_UPDATE = "permission.update",
	PERMISSION_DELETE = "permission.delete"
}

export async function setupPermission(connection: Connection) {
	const repository: Repository<Permission> = connection.getRepository(Permission);
	const permissions = Object.values(Permissions).map((permission) => {
		return {
			name: permission
		};
	});
	await repository.createQueryBuilder().insert().values(permissions).onConflict("(name) DO NOTHING").execute();
}
