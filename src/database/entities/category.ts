import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Idea } from "./idea";

@Entity()
export class Category {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany(() => Idea, (idea) => idea.categories)
	ideas: Promise<Idea[]>;
}
