var RecordModel = require("../models/recordmodel");
 
var appRouter = function(app) {
	
    app.post("/api/save", function (req, res) {
        console.log("Request body..." + JSON.stringify(req.body.formData));
        var formData = req.body.formData;
        if (!formData.profileid) {
			return res.status(400).send({"status": "error", "message": "Profile ID is required"});
        } else if (!formData.firstname) {
			return res.status(400).send({"status": "error", "message": "First Name is required"});
        } else if (!formData.lastname) {
			return res.status(400).send({"status": "error", "message": "Last Name is required"});
        } else if (!formData.phone) {
			return res.status(400).send({"status": "error", "message": "Phone Number is required"});
		}

        RecordModel.save(formData, function (error, result) {
			if(error) {
				return res.status(400).send(error);
			}
			res.send(result);
		});

        RecordModel.sendSMS(formData, function (error, result) {
		    if (error) {
		        return res.status(400).send(error);
		    }
		    res.send(result);

		    console.log(result);
		});
		
	});	
 
app.get("/api/get", function(req, res) {
    if(!req.query.document_id) {
        return res.status(400).send({"status": "error", "message": "A document id is required"});
    }
    RecordModel.getByDocumentId(req.query.document_id, function(error, result) {
        if(error) {
            return res.status(400).send(error);
        }
        res.send(result);
    });
}); 
 
app.post("/api/delete", function(req, res) {
    if(!req.body.document_id) {
        return res.status(400).send({"status": "error", "message": "A document id is required"});
    }
    RecordModel.delete(req.body.document_id, function (error, result) {

        if(error) {
            return res.status(400).send(error);
        }
        res.send(result);
    });
});

app.post("/api/archive", function (req, res) {
    if (!req.body.document_id) {
        return res.status(400).send({ "status": "error", "message": "A document id is required" });
    }
    RecordModel.archive(req.body.document_id, function (error, result) {

        if (error) {
            return res.status(400).send(error);
        }
        res.send(result);
    });
});

app.post("/api/restore", function (req, res) {
    if (!req.body.document_id) {
        return res.status(400).send({ "status": "error", "message": "A document id is required" });
    }
    RecordModel.restore(req.body.document_id, function (error, result) {

        if (error) {
            return res.status(400).send(error);
        }
        res.send(result);
    });
});


app.get("/api/getAll", function(req, res) {
    RecordModel.getAll(function(error, result) {
        if(error) {
            return res.status(400).send(error);
        }
        res.send(result);
    });
});
 
app.get("/api/getArchive", function (req, res) {
    RecordModel.getArchive(function (error, result) {
        if (error) {
            return res.status(400).send(error);
        }
        res.send(result);
    });
});

};
 
module.exports = appRouter;