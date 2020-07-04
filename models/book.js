'use strict'
const Sequelize = require('sequelize');
const  { sequelize } = require('.');


module.exports = (sequelize) => {
    class Book extends Sequelize.Model {}
    Book.init({
        title: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Title" is required'
                }
            }
        },
        author: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Author" is required'
                }
            }
        },
        genre: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Genre" is required'
                },
                is: {
                    args: /^[a-zA-Z]*$/,
                    msg: '"genre" value must be letters only'
                }
            }
        },
        year: {
            type: Sequelize.INTEGER,
            validate: {
                is: {
                    args: /^\d{4}$/,
                    msg: '"Year" value is invalid'
                }
            }
        }
    },{ sequelize });

    return Book;
}