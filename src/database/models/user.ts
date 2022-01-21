import { Document, Model, model, Schema } from "mongoose";

interface User extends Document {
	email: string;
	password: string;
}

const UserSchema = new Schema<User>({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

const UserModel: Model<User> = model("User", UserSchema);

export { User, UserModel };
