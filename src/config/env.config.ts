export default () => ({
  env: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/nestjs_graphql_db',
});
