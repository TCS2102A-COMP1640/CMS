import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Idea } from "./idea";
import { User } from "./user";

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Idea, (idea) => idea.comments, { nullable: false })
	idea: Idea;

	@ManyToOne(() => User, (user) => user.comments, { nullable: false })
	user: User;

	@Column()
	content: string;

	@Column()
	isAnonymous: boolean;
}
