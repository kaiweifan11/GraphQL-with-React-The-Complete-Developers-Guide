const graphql = require('graphql');
//const _ = require('lodash');
const axios = require("axios");

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

// mock
// const users = [
//     { id: '23', firstName: 'Bill', age: 20},
//     { id: '47', firstName: 'Samantha', age: 21}
// ]

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    // UserType uses CompanyType and CompanyType uses UserType
    // this causes an error because CompanyType is trying to use Usertype before it is defined
    // change fields to a function to prevent circular reference
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get( `http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data)
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        firstName: { type: GraphQLString},
        age: { type: GraphQLInt},
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                //console.log(parentValue)
                return axios.get( `http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data)
            }
        }
    }
});

// where to get the first node in graphql 
// have to have first node to search for the rest of the nested information
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                // go into the db and returns it
                // return _.find(users, { id: args.id });
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(response => response.data); // response always inside data
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString }},
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(res => res.data)
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString)},
                age: { type: new GraphQLNonNull(GraphQLInt)},
                companyId: { type: GraphQLString}
            },
            resolve(parentValue, { firstName , age }) {
                return axios.post('http://localhost:3000/users', { firstName , age })
                    .then(res => res.data);
            }
        },
        deleteUser: {
            type: UserType,
            args: { id: { type: new GraphQLNonNull(GraphQLString) } },
            resolve(parentValue, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(res => res.data);
            }
        },
        editUser: {
            type: UserType,
            args: { 
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString},
                age: { type: GraphQLInt},
                companyId: { type: GraphQLString}
            },
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(res => res.data);
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})

/*
Example of Queries

    query findCompanies {
        apple: company (id: "1") {
            ...companyDetails
        }
        google: company (id: "2") {
            ...companyDetails
        }
    }

    fragment companyDetails on Company {
        id
        name
        description
        users {
            firstName
        }
    }

    mutation {
        addUser(
            firstName: "Stephen",
            age: 26,
        ) {
            id
            firstName
            age
        }
    }

    mutation {
        editUser(
            id: "40",
            firstName: "Samantha2",
            age: 50
        ) {
            id
            firstName
            age
            company {
            id
            }
        }
    }
*/