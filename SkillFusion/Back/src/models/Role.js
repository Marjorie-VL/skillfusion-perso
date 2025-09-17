import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection.js";

export class Role extends Model {}

Role.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "role",
	},
);


