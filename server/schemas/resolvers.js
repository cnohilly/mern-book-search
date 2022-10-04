const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // query to get the information for the current user
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        }
    },

    Mutation: {
        // login mutator that will check if the user exists, if they do it will then verify their password
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        // mutator to add or create a new user
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        // mutator to add a book to the current user's savedBooks
        saveBook: async (parent, { input }, context) => {
            console.log(input);
            if (context.user) {
                return await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: { ...input } } },
                    { new: true }
                )
            }
            throw new AuthenticationError('You need to be logged in');
        },
        // mutator to remove a book from the current user's savedBooks
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: bookId } },
                    { new: true }
                );
            }
            throw new AuthenticationError('You need to be logged in');
        }
    }
}

module.exports = resolvers;