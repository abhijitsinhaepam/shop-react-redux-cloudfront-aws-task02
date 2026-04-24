import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListLambda = new NodejsFunction(this, 'getProductsList', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: 'lambda/getProductsList.ts',
      handler: 'handler',
    });

    const getProductsByIdLambda = new NodejsFunction(this, 'getProductsById', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: 'lambda/getProductsById.ts',
      handler: 'handler',
    });

    // ✅ CORS ENABLED HERE
    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service',
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const products = api.root.addResource('products');
    const productById = products.addResource('{productId}');

    products.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsListLambda)
    );

    productById.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsByIdLambda)
    );

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}