import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Connection } from "typeorm";
import { User } from "./user";

@Entity()
export class Department {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@OneToMany(() => User, (user) => user.department)
	users: Promise<User[]>;
}

export async function setupDepartment(connection: Connection) {}
