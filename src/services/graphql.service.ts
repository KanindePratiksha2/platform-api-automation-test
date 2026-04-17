/**
 * GraphQL API Service
 *
 * This service provides methods for making GraphQL API requests.
 * All GraphQL queries and mutations should be defined here.
 */

import { BaseAPIService } from './base.service';
import { API_ENDPOINTS } from '@config/endpoints.config';

export class GraphQLService extends BaseAPIService {
  /**
   * Execute a GraphQL query
   *
   * @param query - GraphQL query string
   * @param variables - Query variables (optional)
   * @param token - Authentication token (optional)
   * @returns Pactum spec instance
   */
  static query(
    query: string,
    variables?: Record<string, any>,
    token?: string,
  ) {
    const spec = this.createSpec().post(API_ENDPOINTS.GRAPHQL);

    const body: any = { query };
    if (variables) {
      body.variables = variables;
    }

    spec.withJson(body);

    if (token) {
      this.withAuth(spec, token);
    }

    return spec;
  }

  /**
   * Execute a GraphQL mutation
   *
   * @param mutation - GraphQL mutation string
   * @param variables - Mutation variables (optional)
   * @param token - Authentication token (optional)
   * @returns Pactum spec instance
   */
  static mutation(
    mutation: string,
    variables?: Record<string, any>,
    token?: string,
  ) {
    // Mutations use the same endpoint as queries
    return this.query(mutation, variables, token);
  }

  /**
   * Execute an authenticated query
   *
   * @param query - GraphQL query string
   * @param token - Authentication token
   * @param variables - Query variables (optional)
   * @returns Pactum spec instance
   */
  static authenticatedQuery(
    query: string,
    token: string,
    variables?: Record<string, any>,
  ) {
    return this.query(query, variables, token);
  }

  /**
   * Predefined GraphQL Queries
   */
  static queries = {
    /**
     * Get current user information
     */
    GET_ME: `
      query {
        getMe
      }
    `,

    /**
     * Get user by ID
     */
    GET_USER: (id: string) => `
      query {
        user(id: "${id}") {
          id
          name
          email
        }
      }
    `,

    /**
     * Get users list
     */
    GET_USERS: `
      query GetUsers($limit: Int, $offset: Int) {
        users(limit: $limit, offset: $offset) {
          id
          name
          email
        }
      }
    `,
  };

  /**
   * Predefined GraphQL Mutations
   */
  static mutations = {
    /**
     * Create a new user
     */
    CREATE_USER: `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `,

    /**
     * Update user
     */
    UPDATE_USER: `
      mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          name
          email
        }
      }
    `,

    /**
     * Delete user
     */
    DELETE_USER: (id: string) => `
      mutation {
        deleteUser(id: "${id}") {
          success
          message
        }
      }
    `,
  };
}
