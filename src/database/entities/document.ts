import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Idea } from "./idea";

@Entity()
export class Document {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Idea, (idea) => idea.comments, { onDelete: "SET NULL" })
	idea: Idea;

	@Column({ nullable: false })
	name: string;

	@Column({ nullable: false, unique: true })
	path: string;
}
