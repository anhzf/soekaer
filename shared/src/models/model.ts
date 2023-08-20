import { now } from './_adapter';

export abstract class Model<T extends Object> {
  protected _id?: string;

  private _changes: Partial<T> = {};

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

    this._changes[propName] = value;

    return this;
  }

  get<TPropName extends keyof T>(propName: TPropName) {
    return this._data[propName];
  }

  get id() {
    return this._id || '';
  }

  get data() {
    return this._data;
  }
}
