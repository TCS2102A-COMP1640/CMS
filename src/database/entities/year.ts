import { Entity, PrimaryGeneratedColumn, Column, Connection } from "typeorm";

@Entity()
export class AcademicYear {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@Column({ type: "timestamptz", nullable: false })
	openingDate: Date;

	@Column({ type: "timestamptz", nullable: false })
	closureDate: Date;

	@Column({ type: "timestamptz", nullable: false })
	finalClosureDate: Date;
}

export async function setupAcademicYear(connection: Connection) {}
