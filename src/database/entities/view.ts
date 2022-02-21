import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
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

	@UpdateDateColumn({ type: "timestamp" })
	updateTimestamp: Date;
}
