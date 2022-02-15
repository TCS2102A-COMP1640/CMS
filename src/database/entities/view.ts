import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./user";
import { Idea } from "./idea";

@Entity()
export class View {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Idea, (idea) => idea.views, { nullable: false, onDelete: "CASCADE" })
	idea: Idea;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	user: User;

	@CreateDateColumn({ type: "timestamp" })
	createTimestamp: Date;

	@CreateDateColumn({ type: "timestamp" })
	updateTimestamp: Date;
}
