import { Entity, PrimaryGeneratedColumn, Column, Connection } from "typeorm";

@Entity()
export class Department {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;
}

export async function setupDepartment(connection: Connection) {}
