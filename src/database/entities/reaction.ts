import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "./user";
import { Idea } from "./idea";

export enum Reactions {
	NONE = 0,
	THUMB_UP = 1,
	THUMB_DOWN = 2
}

@Entity()
export class Reaction {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Idea, (idea) => idea.reactions, { nullable: false, onDelete: "CASCADE" })
	idea: Idea;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	user: User;

	@Column({ nullable: false, default: Reactions.NONE })
	type: number;
}
