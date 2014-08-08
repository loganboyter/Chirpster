chirpApp.Ajax = function (verb, URL, data, success, failure) {
    var request = new XMLHttpRequest();
    request.open(verb, URL);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            success(this.response);
        }
        else {
            failure("Error on " + verb + ": " + this.response);
        }
    }
    request.onerror = function () {
        console.log("Comm error on" + verb);
    }
    request.send(JSON.stringify(data));
}

chirpApp.AjaxGet = function (URL, success, failure) {
    chirpApp.Ajax("GET", URL, null, success, failure)
}

chirpApp.AjaxPost = function(URL, data, success, failure) {
    chirpApp.Ajax("POST", URL, data, success, failure)
}

chirpApp.AjaxDelete = function (URL, data, success, failure) {
    chirpApp.Ajax("DELETE", URL, data, success, failure);
}

chirpApp.upload = function (targetURL, toUpload) {
    chirpApp.Ajax(
        "POST",
        chirpApp.urlMaker(null, [targetURL]),
        toUpload,
        function (a) {
            console.log("POST Successful");
            chirpApp[targetURL].push(toUpload); 
            chirpApp.drawData(targetURL);
        },
        console.log
        )
}