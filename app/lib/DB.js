module.exports = function instance(name, opts) {
  opts || (opts = {});

  return {
    name: name,
    debug: (typeof opts.debug === 'boolean') ? opts.debug : (Ti.App.deployType !== 'production'),
    open: function open() {
      return Ti.Database.open(this.name);
    },
    transaction: function begin(cb) {
      var db = this.open();
      db.execute('BEGIN');
      cb(db);
      db.execute('COMMIT');
      db.close();
      
      return this;
    },
    remove: function remove() {
      var db = this.open();
      db.remove();
      db.close();
      
      return this;
    },
    execute: function execute(sql, vararg) {
      vararg = parseArgs(arguments);
      this.debug && debug('execute', sql, vararg);

      var db = this.open();
      var rs = vararg ? db.execute(sql, vararg) : db.execute(sql);

      var result = (sql.substr(0, 7).toLowerCase() === 'insert ') ? db.lastInsertRowId : db.rowsAffected;

      // if it's a query that returns a resultset, close it
      rs && rs.close();
      db.close();

      return result;
    },
    fetchRows: function fetchRows(sql, vararg) {
      vararg = parseArgs(arguments);
      this.debug && debug('fetchRows', sql, vararg);

      var rows = [];
      var db = this.open();
      var rs = vararg ? db.execute(sql, vararg) : db.execute(sql);

      if (rs.rowCount > 0) {
        var fields = [];
        var fieldCount = rs.fieldCount;

        // for each field
        for (var i = 0; i < fieldCount; i++) {

          // map index to name
          fields[i] = rs.fieldName(i);
        }

        // for each row
        while (rs.isValidRow()) {
          var row = {};

          // for each field
          for (var j = 0; j < fieldCount; j++) {
            row[fields[j]] = rs.field(j);
          }

          rows.push(row);

          rs.next();
        }
      }

      rs.close();
      db.close();

      return rows;
    },
    fetchRow: function fetchRow(sql, vararg) {
      vararg = parseArgs(arguments);
      this.debug && debug('fetchRow', sql, vararg);

      var row;
      var db = this.open();
      var rs = vararg ? db.execute(sql, vararg) : db.execute(sql);

      if (rs.rowCount > 0) {
        row = {};

        // for each field
        for (var i = 0; i < rs.fieldCount; i++) {

          // use fieldName as key and map to value
          row[rs.fieldName(i)] = rs.field(i);
        }
      }

      rs.close();
      db.close();

      return row;
    },
    fetchCol: function fetchCol(sql, vararg) {
      vararg = parseArgs(arguments);
      this.debug && debug('fetchCol', sql, vararg);

      var col = [];
      var db = this.open();
      var rs = vararg ? db.execute(sql, vararg) : db.execute(sql);

      if (rs.rowCount > 0) {
        var fieldCount = rs.fieldCount;

        while (rs.isValidRow()) {
          col.push(rs.field(0));

          rs.next();
        }
      }

      rs.close();
      db.close();

      return col;
    },
    fetchOne: function fetchOne(sql, vararg) {
      vararg = parseArgs(arguments);
      this.debug && debug('fetchOne', sql, vararg);

      var one;
      var db = this.open();
      var rs = vararg ? db.execute(sql, vararg) : db.execute(sql);

      if (rs.rowCount > 0) {
        one = rs.field(0);
      }

      rs.close();
      db.close();

      return one;
    },
    format: function format(sql, vararg) {
      vararg = parseArgs(arguments);

      return formatter(sql, vararg);
    }
  };
};

function parseArgs(args) {
  args = Array.prototype.slice.call(args);

  var sql = args.shift();

  // the first arg after sql is an array containing all varargs
  if (args.length === 1 && Array.isArray(args[0]) && (sql.match(/\?/g) || []).length >= args[0].length) {
    args = args[0];
  }

  return args;
}

function debug(label, sql, vararg) {
  console.debug('[' + label + '] ' + formatter(sql, vararg));
}

function formatter(sql, vararg) {
  var i = -1;

  return (vararg ? sql.replace(/\?/g, function replacer() {
    i++;
    return (typeof vararg[i] === 'string') ? '"' + vararg[i] + '"' : vararg[i];
  }) : sql);
}