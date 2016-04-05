var moment = require('alloy/moment');

exports.definition = {
  config: {
    columns: {
      id: 'TEXT UNIQUE',
      fromTime: 'INTEGER',
      toTime: 'INTEGER'
    },
    adapter: {
      type: 'sql',
      collection_name: 'rides',
      idAttribute: 'id'
    }
  },
  extendModel: function(Model) {

    _.extend(Model.prototype, {

      // Since Alloy 1.8.2 we can define our transform here instead of where we do data binding
      transform: function() {
        var attributes = this.toJSON();

        attributes.fromTimeFormatted = attributes.fromTime ? moment(attributes.fromTime).format('LLLL') : null;
        attributes.toTimeFormatted = attributes.toTime ? moment(attributes.toTime).format('LLLL') : null;

        return attributes;
      }
    });

    return Model;
  }
};
