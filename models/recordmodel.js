var uuid = require("uuid");
var db = require("../app").bucket;
var config = require("../config");
var N1qlQuery = require('couchbase').N1qlQuery;
var twilio = require('twilio');
 
function RecordModel() { };

RecordModel.save = function (data, callback) {

    var jsonObject = {
        profileid: data.profileid,
        firstname: data.firstname,
        lastname: data.lastname,
        suffix: data.suffix,
        phone: data.phone,
        employer: data.employer,
        dateofhire: data.dateofhire,
        receiptdate: data.receiptdate,
        requesttype: data.requesttype,
        comment: data.comment,
        status: data.status.status,
        archiveFlag: "N"
    };

    var documentId = data.document_id ? data.document_id : uuid.v4();

    db.upsert(documentId, jsonObject, function (error, result) {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, { message: "success", data: result });
    });

};
 
RecordModel.getByDocumentId = function(documentId, callback) {
    var statement = "SELECT profileid, firstname, lastname, suffix, phone, employer, dateofhire, receiptdate, requesttype, comment, status " +
                    "FROM `" + config.couchbase.bucket + "` AS users " +
                    "WHERE META(users).id = $1 " ;
    var query = N1qlQuery.fromString(statement);
    db.query(query, [documentId], function(error, result) {
        if(error) {
            return callback(error, null);
        }
        callback(null, result);        
    });
};


RecordModel.delete = function(documentId, callback) {
    db.remove(documentId, function(error, result) {
        if(error) {
            callback(error, null);
            return;
        }
        callback(null, {message: "success", data: result});
    });
}; 

RecordModel.archive = function (documentId, callback) {
    var statement = "UPDATE " +
                    "`" + config.couchbase.bucket + "` AS users " +
                    " SET archiveFlag = $2" + 
                    " WHERE META(users).id = $1";

    var query = N1qlQuery.fromString(statement);
    db.query(query, [documentId,"Y"], function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });

};


RecordModel.getAll = function(callback) {
    var statement = "SELECT META(users).id, profileid, firstname, lastname, suffix, phone, employer, dateofhire, receiptdate, requesttype, comment, status " +
                    "FROM `" + config.couchbase.bucket + "` AS users " +
                    "WHERE archiveFlag = 'N' "
					"ORDER BY profileid";
    var query = N1qlQuery.fromString(statement).consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    db.query(query, function(error, result) {
        if(error) {
            return callback(error, null);
        }
        callback(null, result);
    });
};


RecordModel.getArchive = function (callback) {
    var statement = "SELECT META(users).id, profileid, firstname, lastname, suffix, phone, employer, dateofhire, receiptdate, requesttype, comment, status " +
                    "FROM `" + config.couchbase.bucket + "` AS users " +
                    "WHERE archiveFlag = 'Y' "
    "ORDER BY profileid";
    var query = N1qlQuery.fromString(statement).consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    db.query(query, function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });
};

RecordModel.restore = function (documentId, callback) {
    var statement = "UPDATE " +
                    "`" + config.couchbase.bucket + "` AS users " +
                    " SET archiveFlag = $2" +
                    " WHERE META(users).id = $1";

    var query = N1qlQuery.fromString(statement);
    db.query(query, [documentId, "N"], function (error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });

};

RecordModel.sendSMS = function (data, callback) {
    if (data.status.sendSMS == 'Yes') {

        // Find your account sid and auth token in your Twilio account Console.
        var client = twilio('AC399151d282df1bfd7ff8ba2677db18b7', '82bf1257da9707451f728e93a9eeecac');

        // Send the text message.
        client.messages.create({
            to: data.phone,
            from: "+16158002938",
            body: data.status.message
        }, function (err, message) {
            console.log(message);
        });
     
    }
}; 
 
 
module.exports = RecordModel;