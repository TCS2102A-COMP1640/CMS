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

	@Column()
	content: string;

	@CreateDateColumn({ type: "timestamp" })
	createTimestamp: Date;
}
