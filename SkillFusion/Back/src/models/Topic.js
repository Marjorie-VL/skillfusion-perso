import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection.js";

export class Topic extends Model {}

Topic.init(
    {
        id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },       
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'topic',
    }
);
