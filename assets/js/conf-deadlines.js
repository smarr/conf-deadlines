"use strict";
let simplifiedTitles = {
    'abstract': 'Abstract',
    'paper registration deadline':'Abstract',
    'abstract submission deadline':'Abstract',
    'abstract submission':'Abstract',
    'abstract submission deadline (recommended)':'Abstract',
    'abstract submission (recommended)':'Abstract',

    'paper': 'Paper',
    'full paper submission':'Paper',
    'full paper deadline':'Paper',
    'paper submission':'Paper',
    'submission deadline':'Paper',

    'second round submission deadline':'Paper rev.',
    'revised papers due':'Paper rev.',
    'revisions deadline':'Paper rev.',

    'position/wip deadline':'WIP Paper',
    'second submission deadline for position/wip papers':'WIP Paper',
    'second submission deadline (wip and position papers only)':'WIP Paper',

    'artifact submission':'Artifact',

    'notification':'Notification',
    'final decision notification':'Notification',
    'final notifications':'Notification',
    'author notification':'Notification',
    'author notifications':'Notification',
    'position/wip author notification': 'Notification',
    'primary notification':'Notification',
    'final notification':'Notification',

    'author notification (1st phase)': 'Notification',
    'first phase notifications': 'Notification',
    'second deadline notifications':'Notification',

    'author response':'Response',
    'author-response period':'Response',
    'author response period':'Response',

    'camera ready submission':'Camera Ready',
    'camera-ready deadline':'Camera Ready',
    'acm camera ready deadline':'Camera Ready',
    'camera ready':'Camera Ready',
    'final version due':'Camera Ready',
    'final versions due':'Camera Ready',
    'camera ready deadline':'Camera Ready',
    'final versions due (if mandatory revisions)':'Camera Ready',

    'event': 'Event',
    'symposium': 'Event',
    'conference': 'Event',
    'workshop':'Event',
    'pldi main conference':'Event',
    'agere! workshop':'Event'
    };
function simplifyTitle(title) {
    var result;
    if (title.toLowerCase() in simplifiedTitles) {
        result = simplifiedTitles[title.toLowerCase()];
    } else {
        result = title;
        console.log(result);
    }
    return result;
}

function simpleEscape(someString) {
    return someString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}



function estimateForCurrentYear(data) {
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    for (let conf of data) {
        if (conf.dates.length === 0) {
            continue;
        }

        let isNotCurrent = new Date(conf.dates[0].date).getFullYear() < currentYear;

        for (let date of conf.dates) {
            let dateObj = new Date(date.date);
            if (dateObj.getFullYear() < currentYear) {
                // let estimatedDate =

            }
        }
    }
}


function sortDeadlinesByDates(dates) {
    dates.sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });
}

// sort order: rank, first date, name
function sortEvents(data) {
    data.sort(function (confA, confB) {
        let rankCompare = confA.rank.localeCompare(confB.rank);
        if (rankCompare !== 0) {
            return rankCompare;
        }

        if (confA.dates[0] !== undefined && confB.dates[0] !== undefined) {
          let deadlinesCompare = confA.dates[0].date.localeCompare(confB.dates[0].date);
          if (deadlinesCompare !== 0) {
              return deadlinesCompare;
          }
        }

        return confA.name.localeCompare(confB.name);
    });
}


function sortEventData(data) {
    // first sort the dates
    for (let conf of data) {
        sortDeadlinesByDates(conf.dates);
    }

    sortEvents(data);
}

function showConferenceDeadlines(data) {
    sortEventData(data);

    let tableBody = $("#deadlines");

    for (let conf of data) {
        if (conf.dates) {
            tableBody.append(
                `<tr>
                    <td><a href="${conf.url}">${simpleEscape(conf.name)}</a></td>
                    <td>${conf.rank}</td>
                 </tr>`);
        } else {
            console.error(`${conf.name} doesn't have dates`)

            tableBody.append(
                `<tr>
                    <td>${conf.name}</td>
                    <td></td>
                    <td></td>
                 </tr>`);
        }
    }

    visualizeConfTimes(data);
}


function getNotificationDate(dates) {
    for (let d of dates) {
        let title = simplifyTitle(d.title);
        if (title == "Notification") {
            return d;
        }
    }
    return null;
}

function visualizeConfTimes(data) {
    let times = [];
    let confs = [];

    var minDate = null;
    var maxDate = null;

    var currentRank = null;
    var withSameRank = null;

    for (let conf of data) {
        if (currentRank !== conf.rank) {
            currentRank = conf.rank;
            withSameRank = [];
            let rankGroupId = confs.length + 1;
            confs.push({
                id: rankGroupId,
                content: `${currentRank} ranked`,
                nestedGroups: withSameRank});
        }

        let confId = confs.length + 1;
        confs.push({id: confId, content: simpleEscape(conf.name)});
        withSameRank.push(confId);

        if (conf.dates) {
            var endDate = null;
            var submissionDate = null;

            for (let confDate of conf.dates) {
                if (confDate === endDate) {
                    endDate = null;
                    continue;
                }

                if (minDate === null) {
                    minDate = confDate.date;
                    maxDate = confDate.date;
                } else {
                    if (confDate.date < minDate) { minDate = confDate.date; }
                    if (confDate.date > maxDate) { maxDate = confDate.date; }
                }

                let title = simplifyTitle(confDate.title);

                // not super important, let's ignore these
                if (title == 'Abstract') {
                    continue;
                }

                if (title === "Paper") {
                    endDate = getNotificationDate(conf.dates);
                    submissionDate = confDate;
                }

                let confTime = {
                    id: times.length + 1,
                    content: title,
                    start: confDate.date,
                    group: confId,
                    title: confDate.title
                }
                if (endDate !== null && submissionDate === confDate) {
                    confTime.end = endDate.date;
                    confTime.title += ', ' + endDate.title;
                    confTime.content = "Reviewing";
                }

                if (title == 'Event' || title == 'Notification' || title == 'Camera Ready') {
                    confTime.type = 'point';
                }
                times.push(confTime);
            }
        }
    }

    var items = new vis.DataSet(times);
    var groups = new vis.DataSet(confs);

    var container = document.getElementById('visualization');
    var options = {
      align: 'left',
      start: minDate,
      end: maxDate,
      editable: false,
      stack: false,
      groupOrder: 'id' // group order is determined by id, since we already sorted the data
    };

    var timeline = new vis.Timeline(container, items, groups, options);
}

$(function() {
    $.getJSON("deadlines.json", showConferenceDeadlines);
});
