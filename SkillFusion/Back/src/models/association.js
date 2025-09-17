import { sequelize } from "./connection.js";
import { Lesson } from "./Lesson.js";
import { Category } from "./Category.js";
import { Material } from "./Material.js";
import { Users } from "./Users.js";
import { Role } from "./Role.js";
import { Question } from "./Question.js";
import { Response } from "./Response.js";
import { Step } from "./Step.js";

// CATEGORY <--> LESSON
Category.hasMany(Lesson, {
    as: "lessons",
    foreignKey: { name: "category_id", allowNull: false },
    onDelete: "CASCADE"
});

Lesson.belongsTo(Category, {
    as: "category",
    foreignKey: { name: "category_id" ,allowNull: false },
    onDelete: "CASCADE"
});

// LESSON <--> STEP
Lesson.hasMany(Step, {
    as: "steps",
    foreignKey: { name: "lesson_id",allowNull: false },
    onDelete: "CASCADE"
});
Step.belongsTo(Lesson, {
    as: "lesson",
    foreignKey: { name: "lesson_id",allowNull: false },
    onDelete: "CASCADE"
});

// USERS <--> LESSON
Users.hasMany(Lesson, {
    as: 'lessons',
    foreignKey: 'users_id',
    onDelete: 'CASCADE'
});
Lesson.belongsTo(Users, {
    foreignKey: 'users_id',
    as: 'user'
});

// USERS <--> LESSON
Users.belongsToMany(Lesson, {
    through: 'users_has_favorites',
    as: 'favorite_lessons',
    foreignKey: 'users_id',
    otherKey: 'lesson_id',
    onDelete: 'CASCADE',
    timestamps: false
});
Lesson.belongsToMany(Users, {
    through: 'users_has_favorites',
    as: 'users_who_favorited',
    foreignKey: 'lesson_id',
    otherKey: 'users_id',
    onDelete: 'CASCADE',
    timestamps: false
});

// USERS <--> QUESTION
Users.hasMany(Question, {
    as: "questions",
    foreignKey: { name: "users_id", allowNull: false },
    onDelete: "CASCADE"
});
Question.belongsTo(Users, {
    as: "users",
    foreignKey: { name: "users_id", allowNull: false },
    onDelete: "CASCADE"
});

// QUESTION <--> RESPONSE
Question.hasMany(Response, {
    as: "responses",
    foreignKey: { name: "question_id", allowNull: false },
    onDelete: "CASCADE"
});
Response.belongsTo(Question, {
    as: "question",
    foreignKey: { name: "question_id",allowNull: false },
    onDelete: "CASCADE"
});

// USERS <--> RESPONSE
Users.hasMany(Response, {
    as: "responses",
    foreignKey: { name: "users_id", allowNull: false },
    onDelete: "CASCADE"
});
Response.belongsTo(Users, {
    as: "users",
    foreignKey: { name: "users_id", allowNull: false },
    onDelete: "CASCADE"
});

// ROLE <--> USERS
Role.hasMany(Users, {
    as: "users",
    foreignKey: { name: "role_id",allowNull: false },
    onDelete: "CASCADE"
});
Users.belongsTo(Role, {
    as: "role",
    foreignKey: { name: "role_id", allowNull: false },
    onDelete: "CASCADE"
});

// LESSON <--> MATERIAL
Lesson.hasMany(Material,{
    as: "materials",
    foreignKey:{ name: "lesson_id", allowNull: false },
    onDelete: "CASCADE"
});
Material.belongsTo(Lesson,{
    as: "lesson",
    foreignKey: { name: "lesson_id", allowNull: false },
    onDelete: "CASCADE"
})


export { Lesson, Category, Material, Users, Role, Question, Step, Response, sequelize };

