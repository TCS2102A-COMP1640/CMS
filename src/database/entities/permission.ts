import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Role } from "./role";

@Entity()
export class Permission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Promise<Role[]>;
}
