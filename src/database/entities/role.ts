import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { User } from "./user";
import { Permission } from "./permission";

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@ManyToMany(() => Permission, (permission) => permission.roles)
	@JoinTable()
	permissions: Promise<Permission[]>;

	@OneToMany(() => User, (user) => user.role)
	users: Promise<User[]>;
}
