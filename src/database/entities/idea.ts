import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
	CreateDateColumn,
	OneToMany,
	JoinTable
} from "typeorm";
import { User } from "./user";
import { AcademicYear } from "./year";
import { Category } from "./category";
import { Comment } from "./comment";
import { Reaction } from "./reaction";
import { Document } from "./document";
import { View } from "./view";

@Entity()
export class Idea {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	user: User;

	@ManyToOne(() => AcademicYear, { nullable: false, onDelete: "CASCADE" })
	academicYear: AcademicYear;

	@ManyToMany(() => Category, (category) => category.ideas, { cascade: true })
	@JoinTable({
		name: "idea_categories"
	})
	categories: Category[];

	@OneToMany(() => Comment, (comment) => comment.idea)
	comments: Comment[];

	@OneToMany(() => Document, (document) => document.idea, { cascade: true })
	documents: Document[];

	@OneToMany(() => Reaction, (reaction) => reaction.idea)
	reactions: Reaction[];

	@OneToMany(() => View, (view) => view.idea)
	views: View[];

	@Column()
	content: string;

	@CreateDateColumn({ type: "timestamp" })
	createTimestamp: Date;
}
