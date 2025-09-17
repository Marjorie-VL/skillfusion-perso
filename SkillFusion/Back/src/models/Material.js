import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection.js";

export class Material extends Model {}

Material.init(
    {   
        id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
        name: {
            type: DataTypes.STRING,
        },
        lesson_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'material',
    }
);