export class AuthBaseServiceMock {
  createPasswordHash = jest.fn();
  createToken = jest.fn();
  comparePasswords = jest.fn();
}
