import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany,
	OneToMany,
	JoinTable,
	Connection,
	Repository
} from "typeorm";
import { User } from "./user";
import { Permission, Permissions } from "./permission";

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@ManyToMany(() => Permission, { cascade: true })
	@JoinTable({
		name: "role_permissions"
	})
	permissions: Promise<Permission[]>;

	@OneToMany(() => User, (user) => user.role)
	users: Promise<User[]>;
}

export enum Roles {
	GUEST = "guest",
	ADMIN = "admin",
	QA_MANAGER = "qa_manager",
	QA_COORDINATOR = "qa_coordinator",
	STAFF = "staff"
}

export async function setupRole(connection: Connection) {
	const roleRepository: Repository<Role> = connection.getRepository(Role);
	const permissionRepository: Repository<Permission> = connection.getRepository(Permission);
	const roles = Object.values(Roles).map((role) => {
		return {
			name: role
		};
	});

	await roleRepository.createQueryBuilder().insert().values(roles).onConflict("(name) DO NOTHING").execute();

	const allPermission = await permissionRepository.findOne({ name: Permissions.ALL });
	const adminRole = await roleRepository.findOne({ name: Roles.ADMIN });

	if ((await adminRole.permissions).findIndex((p) => p.id === allPermission.id) === -1) {
		await roleRepository.createQueryBuilder().relation("permissions").of(adminRole).add(allPermission);
	}
}
