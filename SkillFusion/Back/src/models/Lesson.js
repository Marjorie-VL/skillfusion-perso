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
    title: {
      type: DataTypes.STRING,
      validate: {
        len: [3, 255]
      },
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: [3, 255]
      },
      allowNull: false
    },
    media_url:{
      type: DataTypes.STRING,
    },
    media_alt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'lesson',
  }
);