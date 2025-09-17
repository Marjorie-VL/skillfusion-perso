import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection.js";

export class Lesson extends Model {}

Lesson.init (

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        len: [3, 250]
      },
      allowNull: false,
      unique: true,
    },
    text: {
      type: DataTypes.TEXT,
      validate: {
        len: [3, 250]
      },
      allowNull: false
    },
    media:{
      type: DataTypes.STRING,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    users_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'lesson',
  }
);