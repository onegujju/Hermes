angular.module("recordsapp", ["ui.router", "datatables", 'ngBootbox'])

    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state("list", {
                "url": "/list",
                "templateUrl": "templates/list.html",
                "controller": "MainController",
                "cache": false
            })
            .state("list_archive", {
                "url": "/list_archive",
                "templateUrl": "templates/list_archive.html",
                "controller": "MainController",
                "cache": false
            })
            .state("item", {
                "url": "/item/:documentId",
                "templateUrl": "templates/item.html",
                "controller": "MainController",
                "cache": false
            })
            .state("item_archive", {
                "url": "/item_archive/:documentId",
                "templateUrl": "templates/item_archive.html",
                "controller": "MainController",
                "cache": false
            })
        ;
        $urlRouterProvider.otherwise("list");
    })


    .controller("MainController", function($scope, $http, $state, $stateParams) {

        $scope.items = {};
        $scope.statusList = [
            { status: "Application Receipt", sendSMS: "Yes", message: "Your application has been received. Our team will contact you if we have questions or if we need you to submit additional materials. Questions?  emg@cfmt.org" },
            { status: "Employment Verification", sendSMS: "No", message: "CFMT staff verifies employment" },
            { status: "Application Review Complete", sendSMS: "Yes", message: "Your application has been reviewed. At this time, no action is needed by you. You will be alerted once an approval decision is made. Questions?  emg@cfmt.org" },
            { status: "Documentation Request", sendSMS: "Yes", message: "Your application has been reviewed. Documentation of your incident is needed. Upload files here https://goo.gl/ZXcVHL or call 615-321-4939 for help." },
            { status: "Vendor Payment Request", sendSMS: "Yes", message: "Your application has been reviewed. Vendor payment information is still needed. Upload bills here https://goo.gl/ZXcVHL or call 615-321-4939 for help." },
            { status: "Additional Materials Received", sendSMS: "Yes", message: "Documentation you submitted has been received. Our team will contact you if we have questions or if we need additional materials. Questions?  emg@cfmt.org" },
            { status: "Additional Materials Request", sendSMS: "Yes", message: "This is a reminder that additional documentation is needed to complete your request for assistance.  Upload files here https://goo.gl/ZXcVHL Questions?  emg@cfmt.org" },
            { status: "Approved(Requested Payment will be sent)", sendSMS: "Yes", message: "Your application for assistance has been approved! Requested payments will be sent out on your behalf within 5 days. Questions?  emg@cfmt.org or 615-321-4939" },
            { status: "Approved(Check will be sent)", sendSMS: "Yes", message: "Your application for assistance has been approved! A check will be sent to the mailing address that you have provided. Questions?  emg@cfmt.org or 615-321-4939" },
            { status: "Payments Disbursed", sendSMS: "Yes", message: "Payments on your behalf have been sent directly to the vendors you requested. You will receive a letter from us with payment details. Questions?  emg@cfmt.org" },
            { status: "Grants Disbursed", sendSMS: "Yes", message: "Your grant check has been sent out, via U.S. mail, to the mailing address you have provided. Questions?  emg@cfmt.org or 615-321-4939" }
        ];

        function findIndexInData(property, value) {
            var result = -1;
            $scope.statusList.some(function (item, i) {
                if (item[property] === value) {
                    result = i;
                    return true;
                }
            });
            return result;
        }


        $scope.fetchAll = function() {
            $http(
                {
                    method: "GET",
                    url: "/api/getAll"
                }
            )
                .success(function(result) {
                    for(var i = 0; i < result.length; i++) {
                        $scope.items[result[i].id] = result[i];
                    }
                })
                .error(function(error) {
                    console.log(JSON.stringify(error));
                });
        }

        $scope.fetchArchive = function () {
            $http(
                {
                    method: "GET",
                    url: "/api/getArchive"
                }
            )
                .success(function (result) {
                    for (var i = 0; i < result.length; i++) {
                        $scope.items[result[i].id] = result[i];
                    }
                })
                .error(function (error) {
                    console.log(JSON.stringify(error));
                });
        }

        if($stateParams.documentId) {
            $http(
                {
                    method: "GET",
                    url: "/api/get",
                    params: {
                        document_id: $stateParams.documentId
                    }
                }
            )
                .success(function(result) {
                    $scope.inputForm = result[0];
                    $scope.inputForm.receiptdate = new Date(result[0].receiptdate);
                    $scope.inputForm.dateofhire = new Date(result[0].dateofhire);
                    $scope.inputForm.status = $scope.statusList[findIndexInData('status', $scope.inputForm.status)];
                    console.log("Input form " + JSON.stringify($scope.inputForm));
                })
                .error(function(error) {
                    console.log(JSON.stringify(error));
                });
        }

        $scope.delete = function (documentId) {

            $http(
                {
                    method: "POST",
                    url: "/api/delete",
                    data: {
                        document_id: documentId
                    }
                }
            )
                .success(function(result) {
                    delete $scope.items[documentId];
                })
                .error(function(error) {
                    console.log(JSON.stringify(error));
                });
        }

        $scope.archive = function (documentId) {

            $http(
                {
                    method: "POST",
                    url: "/api/archive",
                    data: {
                        document_id: documentId
                    }
                }
            )
                .success(function (result) {
                    delete $scope.items[documentId];
                })
                .error(function (error) {
                    console.log(JSON.stringify(error));
                });
        }

        $scope.restore = function (documentId) {

            $http(
                {
                    method: "POST",
                    url: "/api/restore",
                    data: {
                        document_id: documentId
                    }
                }
            )
                .success(function (result) {
                    delete $scope.items[documentId];
                })
                .error(function (error) {
                    console.log(JSON.stringify(error));
                });
        }


        $scope.submit = function () {

            $scope.inputForm.document_id = $stateParams.documentId;
            var formData = $scope.inputForm;

            $http(
                {
                    method: "POST",
                    url: "/api/save",
                    data: {
                        formData
                    }
                }
            )
                .success(function(result) {
                    $state.go("list");
                })
                .error(function(error) {
                    console.log(JSON.stringify(error));
                });
        }



        $scope.requesttypes = ["Natural Disaster", "Injury/Ilness","Death Incident","Catastrophic Circumstance"];

    });