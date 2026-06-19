const AppError = require('../../utils/AppError');

describe('AppError Utility Class', () => {
  it('should create an operational error with custom message and statusCode', () => {
    const error = new AppError('Resource not found', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  it('should default to statusCode 500 and status error', () => {
    const error = new AppError('Database connection lost');

    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
    expect(error.isOperational).toBe(true);
  });
});
