import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection.js";

export class Step extends Model {}

Step.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media_url:{
      type: DataTypes.STRING,
    },
    media_alt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "step",
  },
);
