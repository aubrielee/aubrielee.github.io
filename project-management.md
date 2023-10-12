---
layout: default
title: Aubrie Lee
permalink: /daily-planner
---
# My digital daily planner: a sheet, a script, and a column per day

2023.09.30
{: .centeredText .noIndent}

<br>

In grade school, I used a paper “binder reminder” for my daily tasks. After that, I wanted a digital system. I tried Gantt charts, GTD, Asana, Notion, Emacs org mode, Roam. None of it worked better than the binder reminder, so I started with a simple spreadsheet and turned it into a planner that scrolls horizontally through a calendar and vertically through goals. I call it “Projectory”—a projection of the trajectory of my projects.

<div class="articleImageContainer">
<img src='/media/projectory-timetrix.png' alt='Spreadsheet with dates along the top and projects down the left. Some cells in the middle have tasks in them. For example, J1 contains 2023.09.30, A5 contains “my website”, and J5 contains “write article about Projectory”. Other tasks are about going to the cardinal tech center, scheduling aquatherapy and eye appointments, organizing gopro footage, investigating espanso, and researching manual chairs and echairs.' class='articleImage'>
</div>

_A snapshot of my personal project management spreadsheet._
{: .centeredText .noIndent}

## rows represent goals

I previously outlined these goals in my life plan (my Archiridion), and I realized I wanted a more structured way to outline tasks within goals each day. Some of these goals are also categories for sub-goals.

A few fun examples:
* Abod: Regarding my body and abode.
* Treadger: A ledger of my treasure; digital records, and records of the location of physical objects.
* Quand If I: My take on the quantified self.
* Optimel: Managing time optimally.

## columns represent days

I have the columns colored to represent days’ salience in my mind. Today is clearest, and the further a day is from today, the more obscure it is. By my observations, salience is likely logarithmic rather than linear; for example, I can easily distinguish today and yesterday, but events from yesterday seem more proximate to the day before than to today.

For now, I’ve decided I want to train my mind to have a four-day range of salience in either direction of today (including today). So, on any given day, the column for day 0 (today) is white, the ±1 days (yesterday and tomorrow) are gray, the ±2 days (ereyesterday and overmorrow) are a darker gray, and the ±3 days (foreyesterday and aftermorrow, perhaps) are a gray darker than that. Beyond those are the darkest gray. 

I achieve this coloration with conditional formatting:

* Darken and bold weekends (I include Friday) <br>
Custom formula: `=weekday(A1,1)>=>5`  <br>
Apply to row 1
* Make today white  <br>
Custom formula: `=A$1=TODAY()` <br>
Apply to whole sheet
* Make yesterday gray  <br>
Custom formula: `=A$1=(TODAY()-1)`  <br>
Apply to whole sheet
* Make tomorrow gray  <br>
Custom formula: `=A$1=(TODAY()+1)`  <br>
Apply to whole sheet
* Make the project column (column A) white  <br>
Format cells if: `Is not equal to` `-`  <br>
Apply to column A
* Make everything beyond ±3 days darkest gray  <br>
Custom formula: `=A1<>TODAY()`  <br>
Apply to whole sheet

## moving along the days
All columns older than three days ago are hidden by a script, which I adapted from [this script](https://stackoverflow.com/questions/35208357/google-sheets-hiding-columns-based-on-date-in-row-1):

```js
function processProjectorySimplified() {
    var sheet = SpreadsheetApp.getActiveSheet();

    var now = new Date(); // today
    var reach = 3; // span of number of days ago and ahead I want to keep salient; 3 days ago is day before ereyesterday
    var hideThroughDate = new Date(now);
    hideThroughDate.setDate(now.getDate() - reach - 1); // hide through day before reach date, show from reach date onward

    // Create an array of arrays of the date cells and their dates
    // getSheetValues(startRow, startColumn, numRows, numColumns)
    var cellDates = sheet.getSheetValues(1, 2, 1, sheet.getLastColumn()); // All dates in the spreadsheet in row 1

    // find the index for the day just before the start day.
    // Starting from the left, inspect each item in cellDates and see whether it's the start day.
    var hideThroughCol = 0; // number of columns to hide
    while(hideThroughCol++ <= sheet.getLastColumn()) {
        var then = new Date(cellDates[0][hideThroughCol]);

        // if equal to hideThroughDate
        if(then >= hideThroughDate) {
        break;
        }
    }

    //bounds check
    if(hideThroughCol > sheet.getLastColumn()) return;

    // hide all date columns through hideThroughDate
    sheet.hideColumn(sheet.getRange(1, 2, 1, hideThroughCol)); // row 1, column B, for one row, for number of columns defined by hideThroughCol

    var lastFewDays = sheet.getRange(1, hideThroughCol+1, sheet.getLastRow(), reach+1); // add 1 to hideThroughCol to push past project column (column A); add 1 to reach to include last column hidden
    lastFewDays.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP); // 2021.08.28 set text wrapping to clip for days before today

    Logger.log("Yay!");
}

```

Old tasks don’t carry over. This is by design; if I don’t specifically carry a task over, it drifts away rather than cluttering my days.

## more notes

* The main tab of Projectory is called “Timetrix” (time matrix). If I no longer prioritize a row, I put it in a tab called “Cryoritized” (deprioritized and put in cryo).
* I started this spreadsheet almost four years ago, in January of 2021. The sheet became slow, so now I’m archiving each quarter, whose limits I’ve defined by solstices and equinoxes. To make solstices and equinoxes teal, I compare dates to those in a sheet called Solinoxes: <br>
Custom formula: =MATCH(A$1,INDIRECT("Solinoxes!A1:A"),0) <br>
I hav​​e two of these entries, one of which makes the date bold and italicized.
* Eventually, I want to make a better way to collect today’s tasks and easily see them on my phone.

<br>
On 2021.05.07, I wrote in my Archiridion that I wanted to write a blog post about my project spreadsheet. More than two years later, I’ve finally written it! Logger.log(“Yay!);
