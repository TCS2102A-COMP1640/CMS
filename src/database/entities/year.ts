import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Connection } from "typeorm";
import { Idea } from "./idea";

@Entity()
export class AcademicYear {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "timestamp", nullable: false })
	openingDate: Date;

	@Column({ type: "timestamp", nullable: false })
	closureDate: Date;

	@Column({ type: "timestamp", nullable: false })
	finalClosureDate: Date;

	@OneToMany(() => Idea, (idea) => idea.academicYear)
	ideas: Promise<Idea[]>;
}

export async function setupAcademicYear(connection: Connection) {}
