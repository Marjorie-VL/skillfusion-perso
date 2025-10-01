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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // Temporairement true pour les catégories existantes
            references: {
                model: 'user',
                key: 'id'
            }
        },
    },
    {
        sequelize,
        tableName: 'category',
    }
);

