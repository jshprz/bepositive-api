const Error = {
    AWS_S3_ERROR: 'AWS S3 operation error',
    AWS_COGNITO_ERROR: 'AWS Cognito operation error',
    DATABASE_ERROR: {
        CREATE: 'Database create operation error',
        GET: 'Database get operation error',
        UPDATE: 'Database update operation error',
        DELETE: 'Database delete operation error'
    }
}

export default Error;