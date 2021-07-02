export class RepositoryMock {
  save = jest.fn();
  find = jest.fn();
  findOne = jest.fn();
  update = jest.fn();
  merge = jest.fn();
}
