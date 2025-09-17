import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection.js";

export class Category extends Model {}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,

            primaryKey: true,
            autoIncrement: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'category',
    }
);

