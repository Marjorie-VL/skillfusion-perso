import { sequelize } from "./connection.js";
import { Lesson } from "./Lesson.js";
import { Category } from "./Category.js";
import { Material } from "./Material.js";
import { User } from "./User.js";
import { Role } from "./Role.js";
import { Topic } from "./Topic.js";
import { Reply } from "./Reply.js";
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
User.hasMany(Lesson, {
    as: 'lessons',
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});
Lesson.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// USERS <--> LESSON
User.belongsToMany(Lesson, {
    through: 'favorite',
    as: 'favorite_lessons',
    foreignKey: 'user_id',
    otherKey: 'lesson_id',
    onDelete: 'CASCADE',
    timestamps: false
});
Lesson.belongsToMany(User, {
    through: 'favorite',
    as: 'users_who_favorited',
    foreignKey: 'lesson_id',
    otherKey: 'user_id',
    onDelete: 'CASCADE',
    timestamps: false
});

// USERS <--> TOPIC
User.hasMany(Topic, {
    as: "topics",
    foreignKey: { name: "user_id", allowNull: false },
    onDelete: "CASCADE"
});
Topic.belongsTo(User, {
    as: "user",
    foreignKey: { name: "user_id", allowNull: false },
    onDelete: "CASCADE"
});

// TOPIC <--> REPLY
Topic.hasMany(Reply, {
    as: "replies",
    foreignKey: { name: "topic_id", allowNull: false },
    onDelete: "CASCADE"
});
Reply.belongsTo(Topic, {
    as: "topic",
    foreignKey: { name: "topic_id",allowNull: false },
    onDelete: "CASCADE"
});

// USERS <--> REPLY
User.hasMany(Reply, {
    as: "replies",
    foreignKey: { name: "user_id", allowNull: false },
    onDelete: "CASCADE"
});
Reply.belongsTo(User, {
    as: "user",
    foreignKey: { name: "user_id", allowNull: false },
    onDelete: "CASCADE"
});

// ROLE <--> USER
Role.hasMany(User, {
    as: "users",
    foreignKey: { name: "role_id",allowNull: false },
    onDelete: "CASCADE"
});
User.belongsTo(Role, {
    as: "role",
    foreignKey: { name: "role_id", allowNull: false },
    onDelete: "CASCADE"
});

// USER <--> CATEGORY
User.hasMany(Category, {
    as: "categories",
    foreignKey: { name: "user_id", allowNull: true },
    onDelete: "CASCADE"
});
Category.belongsTo(User, {
    as: "user",
    foreignKey: { name: "user_id", allowNull: true },
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


export { Lesson, Category, Material, User, Role, Topic, Step, Reply, sequelize };

