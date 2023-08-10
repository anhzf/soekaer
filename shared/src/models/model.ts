import { now } from './_adapter';

export abstract class Model<T extends Object> {
  protected _id?: string;

  constructor(
    protected _data: T,
    attrs?: { id?: string }
  ) {
    this._id = attrs?.id;
  }

  set<TPropName extends keyof T>(propName: TPropName, value: T[TPropName]) {
    this._data[propName] = value;

    if ('updatedAt' in this._data) {
      this._data.updatedAt = now();
    }

    return this;
  }

  get<TPropName extends keyof T>(propName: TPropName) {
    return this._data[propName];
  }

  get id() {
    return this._id;
  }

  get data() {
    return this._data;
  }
}
