const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse');

describe('apiResponse Helpers', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should format 200 OK success responses correctly', () => {
    sendSuccess(mockRes, 'Fetch completed', { count: 42 });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Fetch completed',
      data: { count: 42 },
    });
  });

  it('should include optional pagination metadata in success responses', () => {
    sendSuccess(mockRes, 'Fetch completed', [{ id: 1 }], { page: 1, total: 100 });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Fetch completed',
      data: [{ id: 1 }],
      meta: { page: 1, total: 100 },
    });
  });

  it('should format 201 Created responses correctly', () => {
    sendCreated(mockRes, 'Log added', { id: 99 });

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Log added',
      data: { id: 99 },
    });
  });

  it('should format 204 No Content responses correctly', () => {
    sendNoContent(mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.send).toHaveBeenCalled();
  });
});
