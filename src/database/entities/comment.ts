import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Connection } from "typeorm";
import { Idea } from "./idea";
import { User } from "./user";

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Idea, (idea) => idea.comments)
	idea: Idea;

	@ManyToOne(() => User, (user) => user.comments)
	user: User;

	@Column()
	content: string;

	@Column()
	isAnonymous: boolean;
}


export async function setupComment(connection: Connection) {

}
