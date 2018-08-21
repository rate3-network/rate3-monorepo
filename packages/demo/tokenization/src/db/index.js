const dbPrefix = 'db_';

class Table {
  constructor(name, columnsSchema) {
    this.name = name;
    this.columnsSchema = columnsSchema;
    this.rows = [];
  }

  static fromJSON = (raw) => {
    const parsed = (typeof raw === 'string') ? JSON.parse(raw) : raw;
    const table = new Table(parsed.name, parsed.columnsSchema);
    table.rows = parsed.rows;
    return table;
  }

  hasColumn(colName) {
    return Object.prototype.hasOwnProperty.call(this.columnsSchema, colName);
  }

  _rowMatchesFilter(filter, row) {
    for (const filterCol of Object.keys(filter)) {
      if (this.hasColumn(filterCol)) {
        const filterVal = filter[filterCol];
        const colValue = row[filterCol];
        if (typeof filterVal === 'function') {
          if (!filterVal(colValue)) return false;
        } else if (filterVal !== colValue) {
          return false;
        }
      }
    }

    return true;
  }

  exists(filter) {
    return this.rows.filter((existsCount, currRow) => (
      // eslint-disable-next-line no-underscore-dangle
      existsCount + (this._rowMatchesFilter(filter, currRow) ? 1 : 0)
    ), 0);
  }

  select(filter) {
    if (filter === null) return [...this.rows];

    // eslint-disable-next-line no-underscore-dangle
    return this.rows.filter(currRow => this._rowMatchesFilter(filter, currRow));
  }

  insert(rowObj) {
    const sanitizedRowObj = { ...this.columnsSchema };
    for (const col of Object.keys(rowObj)) {
      if (this.hasColumn(col)) {
        sanitizedRowObj[col] = rowObj[col];
      }
    }
    this.rows.push(rowObj);
  }

  update(filter, rowReducer) {
    let updateCount = 0;

    this.rows = this.rows.map((currRow) => {
      // eslint-disable-next-line no-underscore-dangle
      if (this._rowMatchesFilter(filter, currRow)) {
        updateCount += 1;
        return rowReducer(currRow);
      }
      return currRow;
    });

    return updateCount;
  }

  delete(filter) {
    let deleteCount = 0;

    this.rows = this.rows.filter((currRow) => {
      // eslint-disable-next-line no-underscore-dangle
      if (this._rowMatchesFilter(filter, currRow)) {
        deleteCount += 1;
        return false;
      }
      return true;
    });

    return deleteCount;
  }
}

// eslint-disable-next-line func-names
Table.prototype.toJSON = function () {
  return {
    name: this.name,
    columnsSchema: this.columnsSchema,
    rows: this.rows,
  };
};

class LocalStorageDB {
  constructor(dbName) {
    this.db = `${dbPrefix}${dbName}`;
    this.schema = {};
    this.save();
  }

  save() {
    const dump = JSON.stringify(this.schema);
    localStorage.setItem(this.db, dump);
  }

  static load(dbName) {
    const rawData = localStorage.getItem(`${dbPrefix}${dbName}`);

    if (rawData === null) return null;

    const parsed = JSON.parse(rawData);
    const db = new LocalStorageDB(dbName);

    for (const tableName of Object.keys(parsed)) {
      db.schema[tableName] = Table.fromJSON(parsed[tableName]);
    }

    return db;
  }

  createTable(tableName, columns) {
    if (this.schema[tableName] !== undefined) {
      throw new Error('Table exists');
    }
    const columnsSchema = {};
    for (const col of columns) {
      if (columnsSchema[col] !== undefined) {
        throw new Error(`Duplicate column name: ${col}`);
      }
      columnsSchema[col] = null;
    }
    this.schema = {
      ...this.schema,
      [tableName]: new Table(tableName, columnsSchema),
    };
    this.save();
  }

  hasTable(tableName) {
    return Object.prototype.hasOwnProperty.call(this.schema, tableName);
  }

  exists(tableName, filter) {
    if (!this.hasTable(tableName)) {
      throw new Error(`No such table: ${tableName}`);
    }
    return this.schema[tableName].exists(filter);
  }

  select(tableName, filter) {
    if (!this.hasTable(tableName)) {
      throw new Error(`No such table: ${tableName}`);
    }
    return this.schema[tableName].select(filter);
  }

  insert(tableName, rowObj) {
    if (!this.hasTable(tableName)) {
      throw new Error(`No such table: ${tableName}`);
    }
    this.schema[tableName].insert(rowObj);
    this.save();
  }

  update(tableName, filter, rowReducer) {
    if (!this.hasTable(tableName)) {
      throw new Error(`No such table: ${tableName}`);
    }
    const count = this.schema[tableName].update(filter, rowReducer);
    this.save();
    return count;
  }

  delete(tableName, filter) {
    if (!this.hasTable(tableName)) {
      throw new Error(`No such table: ${tableName}`);
    }
    const count = this.schema[tableName].delete(filter);
    this.save();
    return count;
  }
}

export default LocalStorageDB;
