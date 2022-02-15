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

	@ManyToMany(() => Category, { cascade: true })
	@JoinTable({
		name: "idea_categories"
	})
	categories: Promise<Category[]>;

	@OneToMany(() => Comment, (comment) => comment.idea)
	comments: Promise<Comment[]>;

	@OneToMany(() => Document, (document) => document.idea)
	documents: Promise<Document[]>;

	@OneToMany(() => Reaction, (reaction) => reaction.idea)
	reactions: Promise<Reaction[]>;

	@OneToMany(() => View, (view) => view.idea)
	views: Promise<View[]>;

	@Column()
	content: string;

	@CreateDateColumn({ type: "timestamp" })
	createTimestamp: Date;
}
