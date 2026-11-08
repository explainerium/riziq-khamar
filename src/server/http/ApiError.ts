/** Thrown anywhere in the backend; `message` is a key in messages `api.*`. */
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
