import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Connection } from "typeorm";
import { Idea } from "./idea";

@Entity()
export class Category {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@ManyToMany(() => Idea, (idea) => idea.categories)
	ideas: Promise<Idea[]>;
}

export async function setupCategory(connection: Connection) {}
