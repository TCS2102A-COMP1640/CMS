import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Idea } from "./idea";

@Entity()
export class AcademicYear {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "timestamp" })
	openingDate: Date;

	@Column({ type: "timestamp" })
	closureDate: Date;

	@Column({ type: "timestamp" })
	finalClosureDate: Date;

	@OneToMany(() => Idea, (idea) => idea.academicYear)
	ideas: Promise<Idea[]>;
}
