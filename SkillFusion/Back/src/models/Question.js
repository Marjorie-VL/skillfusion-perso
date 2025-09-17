import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection.js";

export class Question extends Model {}

Question.init(
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
       
        
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        users_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'question',
    }
);
