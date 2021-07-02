import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { GqlContext } from './graphql-context.interface';
import { HttpException } from '@nestjs/common';
import { GraphQLError } from 'graphql';

export class GraphQLOptionsService implements GqlOptionsFactory {
  createGqlOptions(): GqlModuleOptions {
    return {
      autoSchemaFile: true,
      sortSchema: true,
      context: this.composeContext,
      formatError: this.formatError,
    };
  }

  private composeContext = ({ req }): GqlContext => {
    const authHeader = req.headers.authorization || '';

    return {
      token: authHeader.replace('Bearer ', ''),
    };
  };

  private formatError = (err: GraphQLError): any => {
    const error: HttpException = err.originalError as any;
    if (!error.getResponse) {
      console.log('Received 500 error', err);
      return {
        statusCode: 500,
        message: error.message,
        error: error.name,
      };
    }

    return error.getResponse();
  };
}
