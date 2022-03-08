import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Connection, Repository } from "typeorm";
import { Role, Roles } from "./role";
import { Department } from "./department";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true, nullable: false })
	email: string;

	@ManyToOne(() => Role, (role) => role.users, { nullable: false, onDelete: "CASCADE" })
	role: Role;

	@ManyToOne(() => Department, { onDelete: "SET NULL" })
	department?: Department;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	password: string;
}

export async function setupUser(connection: Connection) {
	const userRepository: Repository<User> = connection.getRepository(User);
	const roleRepository: Repository<Role> = connection.getRepository(Role);

	const adminSalt = "c542835b52509cbce6f32a3f2e44f52cf4caebbddc2fcc8ebcbb6ca105ec2bd1";
	const adminHash =
		"6fb4ec0fed90c8812c222ecbefcb2c47462b9d9cd24491447019dd4620a7c5f1c97d5285256bddf61df36e1fd5540de2a9be9f6ccfe3977db3bd7dab2c3b6cb1";
	const adminRole = await roleRepository.findOne({ name: Roles.ADMIN });
	await userRepository
		.createQueryBuilder()
		.insert()
		.values({
			email: "admin@university.com",
			firstName: "Admin",
			lastName: "University",
			password: `${adminHash}$${adminSalt}`,
			role: adminRole
		})
		.orIgnore()
		.execute();
}
