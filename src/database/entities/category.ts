import { Entity, PrimaryGeneratedColumn, Column, Connection, ManyToMany } from "typeorm";
import { Idea } from "./idea";

@Entity()
export class Category {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@ManyToMany(() => Idea, (idea) => idea.categories)
	ideas: Idea[];

	ideaCount: number;
}

export async function setupCategory(connection: Connection) {}
