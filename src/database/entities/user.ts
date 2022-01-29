import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Role } from "./role";
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
