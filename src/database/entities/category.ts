import { Entity, PrimaryGeneratedColumn, Column, Connection } from "typeorm";

@Entity()
export class Category {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;
}

export async function setupCategory(connection: Connection) {}
