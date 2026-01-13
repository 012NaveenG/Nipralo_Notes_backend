class ApiResponse {
  constructor(statusCode = 200, message = "success", data = {}) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
