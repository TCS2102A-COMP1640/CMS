import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Idea } from "./idea";
import { User } from "./user";

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Idea, (idea) => idea.comments, { nullable: false, onDelete: "CASCADE" })
	idea: Idea;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	user: User;

	@Column()
	content: string;

	@CreateDateColumn({ type: "timestamptz" })
	createTimestamp: Date;
}
