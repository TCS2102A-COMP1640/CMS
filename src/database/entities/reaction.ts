import { Entity, ManyToOne, Column, Index } from "typeorm";
import { User } from "./user";
import { Idea } from "./idea";

export enum Reactions {
	NONE = 0,
	THUMB_UP = 1,
	THUMB_DOWN = 2
}

@Entity()
export class Reaction {
	@ManyToOne(() => Idea, (idea) => idea.reactions, { nullable: false, onDelete: "CASCADE", primary: true })
	@Index()
	idea: Idea;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE", primary: true })
	@Index()
	user: User;

	@Column({ nullable: false, default: Reactions.NONE })
	type: number;
}
