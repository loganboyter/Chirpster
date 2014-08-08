chirpApp = {};
chirpApp.tweets = [];
chirpApp.messages = [];
chirpApp.friends = [];
chirpApp.profile = {}; // should this be an object?...yes
chirpApp.otherProfile = {};
chirpApp.otherFriends = [];
chirpApp.otherMessages = [];
chirpApp.otherTweets = [];
chirpApp.tweetBlob = [];
chirpApp.timeoutID = "";
chirpApp.secondTimeout = "";
chirpApp.myURL = "chirpster";


chirpApp.inputReader = function (locationId, text) {
    var temp;
    if (text || text == "") {
        temp = document.getElementById(locationId).value;
        document.getElementById(locationId).value = text;
        return temp;
    }
    else { return document.getElementById(locationId).value; }
}

chirpApp.divWriter = function (locationId, text) {
    document.getElementById(locationId).innerHTML = text;
}

chirpApp.urlMaker = function (base, directories) {
    var holder = "https://";
    if (base) {
        holder += base + ".firebaseio.com/"
    }
    else {
        holder += chirpApp.myURL + ".firebaseio.com/"
    }
    if (directories) {
        holder += directories.join("/");
    }

    holder += ".json";
    return holder;

}

chirpApp.drawTweets = function () {
    var holder = "";
    var deleteButton = "";
    chirpApp.tweets.sort(function (a, b) {
        if (a.time < b.time) {
            return 1
        }
        else if (a.time > b.time) {
            return -1
        }
        else { return 0 }
    })
    for (var i in chirpApp["tweets"]) {
        holder += "<div class='well color-testing'><div class='row clearfix'><div class='col-md-2 column'></div>"
        holder += "<div class='col-md-4 column'><span style='color:white'>" + chirpApp["tweets"][i].content + "</span></div>";
        deleteButton = "<button class='btn btn-danger' onclick='chirpApp.delete(" + i + ", \"tweets\", \"drawTweets\")'><i class = 'fa fa-times-circle' style='color:white'></i></button>";
        holder += "<div class='col-md-2 column'>" + deleteButton + "</div></div></div>"
    }
    chirpApp.divWriter("tweets", holder);

}

chirpApp.liveTweets = function () {
    console.log("Live tweets called");
    var x = 0, y = 0;
    chirpApp.tweetBlob = [];
    for (var i in chirpApp.friends) {
        x++
        (function () {
            var q = i;
            chirpApp.AjaxGet(chirpApp.urlMaker(chirpApp.friends[i].url, ["tweets"]), function (data) {
                data = JSON.parse(data);
                for (var d in data) {
                    data[d].name = chirpApp.friends[q].name;
                    data[d].url = chirpApp.friends[q].url
                    data[d].image = chirpApp.friends[q].image;
                    chirpApp.tweetBlob.push(data[d]);
                }
                y++
                if (x === y) { chirpApp.drawLiveTweets(); }
            },
            console.log)
        })()
    }
   chirpApp.secondTimeout = setTimeout(function () { chirpApp.liveTweets() }, 5000);
}


chirpApp.drawLiveTweets = function () {
    var holder = "";
    chirpApp.tweetBlob.sort(function (a, b) {
        if (a.time < b.time) {
            return 1
        }
        else if (a.time > b.time) {
            return -1
        }
        else { return 0 }
    })
    for (var i in chirpApp.tweetBlob) {
        holder += "<div class='well'>";
        holder += "<img class = 'img-rounded' style='width:40px;height:40px' src = '" + chirpApp.tweetBlob[i].image + "' />"
        holder += "<b>" + chirpApp.tweetBlob[i].name + "</b>";
        holder += "<div class='row clearfix'><div class='col-md-2 column'></div>"
        holder += "<div class='col-md-10 column'>" + chirpApp.tweetBlob[i].content + "</div>";
        //holder += "<td>" + new Date(chirpApp.tweetBlob[i].time) + "</td>";
        holder += "</div></div>"
    }
    chirpApp.divWriter("live-feed-content", holder)
}


chirpApp.drawFriends = function () {
    var holder = "";
    var deleteButton = "";
    var name = "";
    for (var i in chirpApp["friends"]) {
        holder += "<tr>"
        if (chirpApp.friends[i].name) { name = chirpApp.friends[i].name }
        else { name = chirpApp.friends[i].url }
        holder += "<td><img class = 'img-rounded' onclick='chirpApp.downloadOtherProfile(\"" + chirpApp['friends'][i].url + "\")' style='width:40px;height:40px' src = '" + chirpApp.friends[i].image + "' />"
        holder+="<button class='btn btn-link' onclick='chirpApp.downloadOtherProfile(\"" + chirpApp['friends'][i].url + "\")'>" + name + "</button></td>";
        deleteButton = "<button class='btn btn-danger' onclick='chirpApp.delete(" + i + ", \"friends\", \"drawFriends\")'><i class = 'fa fa-times-circle' style='color:white'></i></button>";
        holder += "<td>" + deleteButton + "</td></tr>"
    }
    chirpApp.divWriter("friends", holder);
}

chirpApp.downloadOtherProfile = function (url) {
    $(".to-be-hidden").hide();
    clearTimeout(chirpApp.timeoutID);
    chirpApp.AjaxGet(chirpApp.urlMaker(url, ["profile"]), function (data) {
        console.log("GET Successful")
        data = JSON.parse(data);
        chirpApp.otherProfile = {};
        for (var d in data) {
            data[d].key = d;
            chirpApp.otherProfile = data[d]
        }
        chirpApp.drawOtherProfile();
    }
    )
    chirpApp.AjaxGet(chirpApp.urlMaker(url, ["tweets"]), function (data) {
        chirpApp.timeoutID = setTimeout(function () { chirpApp.downloadOtherProfile(url) }, 5000)
        data = JSON.parse(data);
        chirpApp.otherTweets = [];
        for (var d in data) {
            chirpApp.otherTweets.push(data[d]);
        }
        chirpApp.drawOtherTweets();
    })
    chirpApp.AjaxGet(chirpApp.urlMaker(url, ["friends"]), function (data) {
        data = JSON.parse(data);
        chirpApp.otherFriends = [];
        for (var d in data) {
            chirpApp.otherFriends.push(data[d]);
        }
        for (var i in chirpApp.otherFriends) {
            (function () {
                var q = i;
                chirpApp.AjaxGet(chirpApp.urlMaker(chirpApp.otherFriends[i].url, ["profile"]), function (dataTwo) {
                    dataTwo = JSON.parse(dataTwo);
                    for (var d in dataTwo) {
                        chirpApp.otherFriends[q].name = dataTwo[d].name;
                        chirpApp.otherFriends[q].image = dataTwo[d].image;

                    }
                    chirpApp.drawOtherFriends()
                },
            console.log)

            })()
        }
    })
}


chirpApp.drawOtherFriends = function () {
    var holder = "";
    var name = "";
    var addButton = "";
    var friendsUrls = [];
    chirpApp.divWriter("friends", "None =(");
    if (chirpApp.otherFriends[0]) {
        for (var i in chirpApp.otherFriends) {
            holder += "<tr>"
            if (chirpApp.otherFriends[i].name) { name = chirpApp.otherFriends[i].name }
            else { name = chirpApp.otherFriends[i].url }
            holder += "<td><img class = 'img-rounded' onclick='chirpApp.downloadOtherProfile(\"" + chirpApp.otherFriends[i].url + "\")' style='width:40px;height:40px' src = '" + chirpApp.otherFriends[i].image + "' />"
            holder += "<button class='btn btn-link' onclick='chirpApp.downloadOtherProfile(\"" + chirpApp.otherFriends[i].url + "\")'>" + name + "</button></td>";
            for (var j in chirpApp.friends) {
                friendsUrls.push(chirpApp.friends[j].url)
            }
            if ($.inArray(chirpApp.otherFriends[i].url, friendsUrls) === -1 && chirpApp.otherFriends[i].url !== chirpApp.profile.url) {
                addButton = "<td><button class='btn btn-success' onclick='chirpApp.addFriend(\"" + chirpApp.otherFriends[i].url + "\");'><span class='fa fa-plus'></span></button></td>";
            }
            else { addButton = ""; }
            holder += addButton + "</tr>"
        }
        chirpApp.divWriter("friends", holder);

    }
}


chirpApp.drawOtherTweets = function () {
    var holder = "";
    chirpApp.divWriter("tweets", "None =(");
    if (chirpApp.otherTweets[0]) {
        chirpApp.otherTweets.sort(function (a, b) {
            if (a.time < b.time) {
                return 1
            }
            else if (a.time > b.time) {
                return -1
            }
            else { return 0 }
        })
        for (var i in chirpApp["otherTweets"]) {
            holder += "<div class='well color-testing'><div class='row clearfix'><div class='col md-2 column'></div>";
            holder += "<div class='col-md-4-column'><span style='color:white'>" + chirpApp["otherTweets"][i].content + "<span></div>";
            holder += "</div></div>";
        }
        chirpApp.divWriter("tweets", holder);
        holder = "";
    }

}

chirpApp.drawOtherProfile = function () {
    var holder = "";
    chirpApp.divWriter("display-name", "Name: ????");
    chirpApp.divWriter("profile-biography", "????");
    document.getElementById("profile-image").src = "http://i.imgur.com/ZpExsUF.jpg"
    
    if (chirpApp.otherProfile.image) {
        chirpApp.divWriter("display-name", "<span style='color: white'>Name: " + chirpApp.otherProfile.name + "</span>");
        chirpApp.divWriter("profile-biography", "<span style='color:white'>" + chirpApp.otherProfile.bio + "</span>")
        document.getElementById("profile-image").src = chirpApp.otherProfile.image;
    }
   
}

chirpApp.addFriend = function (url) {
    var dataObject = {};
    dataObject.url = url;
    chirpApp.AjaxPost(chirpApp.urlMaker(null, ["friends"]),
        dataObject,
        function () {
            chirpApp.friends.push(dataObject);
            console.log("Added friend successfully");
        },
        function () { console.log("Failure") }
        )
}



chirpApp.drawProfile = function () {
    $(".to-be-hidden").show();
    if (chirpApp.profile.image) {
        chirpApp.divWriter("display-name", "<span style='color:white'>Name: " + chirpApp.profile.name + "</span>")
        chirpApp.divWriter("profile-biography", "<span style='color:white'>" + chirpApp.profile.bio + "</span>")
        document.getElementById("profile-image").src = chirpApp.profile.image;
    }
    else { console.log("No profile to draw") }

}

chirpApp.saveProfileEdits = function () {
    $("#editProfile").modal('hide');
    var profileObject = {};
    profileObject.name = chirpApp.inputReader("profile-name", "");
    profileObject.bio = chirpApp.inputReader("profile-bio", "");
    profileObject.image = chirpApp.inputReader("profile-img", "");
    profileObject.url = chirpApp.inputReader("profile-url", "");
    chirpApp.Ajax("PATCH", chirpApp.urlMaker(null, ["profile", chirpApp.profile.key]), profileObject, function () {
        console.log("PATCH Successful");
        chirpApp.profile = profileObject;
        chirpApp.drawProfile();
    },
    console.log)

}

chirpApp.delete = function (index, directory, drawMethod) {
    var toDelete = chirpApp[directory][index]
    chirpApp.AjaxDelete(chirpApp.urlMaker(null, [directory, toDelete.key]), toDelete.key, function () {
        chirpApp[directory].splice(index, 1);
        chirpApp[drawMethod]();
        console.log("DELETE Successful");
    },
    console.log)
}



chirpApp.eventListeners = function () {
    var sendChirp = document.getElementById("send-tweet");
    var addFriend = document.getElementById("add-friend-button")
    var profileEdit = document.getElementById("edit-profile");
    var homeButton = document.getElementById("home-button");
    var liveFeed = document.getElementById("live-feed");
    sendChirp.addEventListener("click", function () {
        var dataObject = {};
        dataObject.content = chirpApp.inputReader('new-tweet', "");
        dataObject.time = Date.now()
        chirpApp.AjaxPost(chirpApp.urlMaker(null, ["tweets"]), dataObject, function () {
            console.log("POST Successful");
            chirpApp.AjaxGet(chirpApp.urlMaker(null, ["tweets"]), function (data) {
                chirpApp.tweets = [];
                data = JSON.parse(data);
                for (var d in data) {
                    data[d].key = d;
                    chirpApp.tweets.push(data[d]);
                }
                chirpApp.drawTweets();
            },
        console.log)
        },
        console.log)
    })
    addFriend.addEventListener("click", function () {
        var dataObject = {};
        dataObject.url = chirpApp.inputReader("friend-id", "");
        chirpApp.AjaxPost(chirpApp.urlMaker(null, ["friends"]), dataObject, function () {
            console.log("POST Successful");
            chirpApp.AjaxGet(chirpApp.urlMaker(null, ["friends"]), function (data) {
                chirpApp.friends = [];
                data = JSON.parse(data);
                for (var d in data) {
                    data[d].key = d;
                    chirpApp.friends.push(data[d]);
                }
                chirpApp.drawFriends();
            },
        console.log
        )
        },
        console.log);
    })
    profileEdit.addEventListener("click", function () {
        if (chirpApp.profile.name) { chirpApp.inputReader("profile-name", chirpApp.profile.name) }
        if (chirpApp.profile.image) { chirpApp.inputReader("profile-img", chirpApp.profile.image) }
        if (chirpApp.profile.url) { chirpApp.inputReader("profile-url", chirpApp.profile.url) }
        if (chirpApp.profile.bio) { chirpApp.inputReader("profile-bio", chirpApp.profile.bio) }
        $('#editProfile').modal();
    })
    homeButton.addEventListener("click", function () {
        clearTimeout(chirpApp.timeoutID);
        chirpApp.AjaxGet(chirpApp.urlMaker(null, ["tweets"]),
        function (data) {
            data = JSON.parse(data);
            chirpApp.tweets = [];
            for (var d in data) {
                data[d].key = d;
                chirpApp.tweets.push(data[d]);
            }
            chirpApp.drawTweets();
        },
        console.log)
        chirpApp.AjaxGet(chirpApp.urlMaker(null, ["friends"]),
            function (data) {
                chirpApp.friends = [];
                data = JSON.parse(data);
                for (var d in data) {
                    data[d].key = d;
                    chirpApp.friends.push(data[d]);
                }
                for (var i in chirpApp.friends) {
                    (function () {
                        var q = i;
                        chirpApp.AjaxGet(chirpApp.urlMaker(chirpApp.friends[i].url, ["profile"]), function (dataTwo) {

                            dataTwo = JSON.parse(dataTwo);
                            for (var d in dataTwo) {
                                chirpApp.friends[q].name = dataTwo[d].name;
                                chirpApp.friends[q].image = dataTwo[d].image;
                                chirpApp.drawFriends();
                            }
                        },
                    console.log)
                    })()
                }
            },
            console.log
            )
        chirpApp.AjaxGet(chirpApp.urlMaker(null, ["profile"]), function (data) {
            console.log("GET Successful")
            data = JSON.parse(data);
            for (var d in data) {
                data[d].key = d;
                chirpApp.profile = data[d]
            }
            chirpApp.drawProfile();
        })

    })

    liveFeed.addEventListener("click", function () {
        $("#liveFeed").modal("show");
        chirpApp.liveTweets();
        })
}




window.onload = function () {
    chirpApp.eventListeners();
    chirpApp.AjaxGet(chirpApp.urlMaker(null, ["tweets"]),
        function (data) {
            data = JSON.parse(data);
            for (var d in data) {
                data[d].key = d;
                chirpApp.tweets.push(data[d]);
            }
            chirpApp.drawTweets();
        },
        console.log)
    chirpApp.AjaxGet(chirpApp.urlMaker(null, ["friends"]),
        function (data) {
            data = JSON.parse(data);
            for (var d in data) {
                data[d].key = d;
                chirpApp.friends.push(data[d]);
            }
            for (var i in chirpApp.friends) {
                (function () {
                    var q = i;
                    chirpApp.AjaxGet(chirpApp.urlMaker(chirpApp.friends[i].url, ["profile"]), function (dataTwo) {

                        dataTwo = JSON.parse(dataTwo);
                        for (var d in dataTwo) {
                            chirpApp.friends[q].name = dataTwo[d].name;
                            chirpApp.friends[q].image = dataTwo[d].image;
                            chirpApp.drawFriends();
                        }
                    },
                console.log)
                })()
            }
        },
        console.log
        )
    chirpApp.AjaxGet(chirpApp.urlMaker(null, ["profile"]), function (data) {
        console.log("GET Successful")
        data = JSON.parse(data);
        for (var d in data) {
            data[d].key = d;
            chirpApp.profile = data[d]
        }
        chirpApp.drawProfile();
    })
    $('#liveFeed').on('hidden.bs.modal', function () {
        clearTimeout(chirpApp.secondTimeout)
    })
}