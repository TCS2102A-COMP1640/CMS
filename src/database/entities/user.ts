import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Connection, Repository } from "typeorm";
import { Role, Roles } from "./role";
import { Department } from "./department";
import { Idea } from "./idea";
import { Comment } from "./comment";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true, nullable: false })
	email: string;

	@ManyToOne(() => Role, (role) => role.users)
	role: Role;

	@ManyToOne(() => Department, (department) => department.users)
	department: Department;

	@OneToMany(() => Idea, (idea) => idea.user)
	ideas: Promise<Idea[]>;

	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Promise<Comment[]>;

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

	const adminRole = await roleRepository.findOne({ name: Roles.ADMIN });
	await userRepository
		.createQueryBuilder()
		.insert()
		.values({
			email: "admin@university.com",
			firstName: "Admin",
			lastName: "University",
			password: "adminpassword123",
			role: adminRole
		})
		.onConflict("(email) DO NOTHING")
		.execute();
}
