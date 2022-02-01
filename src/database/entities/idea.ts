import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
	CreateDateColumn,
	OneToMany,
	JoinTable,
	Connection
} from "typeorm";
import { User } from "./user";
import { AcademicYear } from "./year";
import { Category } from "./category";
import { Comment } from "./comment";

@Entity()
export class Idea {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.ideas, { nullable: false })
	user: User;

	@ManyToOne(() => AcademicYear, (academicYear) => academicYear.ideas, { nullable: false })
	academicYear: AcademicYear;

	@ManyToMany(() => Category, (category) => category.ideas)
	@JoinTable({
		name: "idea_categories"
	})
	categories: Promise<Category[]>;

	@OneToMany(() => Comment, (comment) => comment.idea)
	comments: Promise<Comment[]>;

	@Column()
	content: string;

	@Column()
	isAnonymous: boolean;

	@CreateDateColumn({ type: "timestamp" })
	createTimestamp: Date;
}

export async function setupIdea(connection: Connection) {}
