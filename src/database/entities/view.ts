import { Entity, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./user";
import { Idea } from "./idea";

@Entity()
export class View {
	@ManyToOne(() => Idea, (idea) => idea.views, { nullable: false, onDelete: "CASCADE", primary: true })
	@Index()
	idea: Idea;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE", primary: true })
	@Index()
	user: User;

	@CreateDateColumn({ type: "timestamp" })
	createTimestamp: Date;

	@UpdateDateColumn({ type: "timestamp", onUpdate: "CURRENT_TIMESTAMP(3)" })
	updateTimestamp: Date;
}
