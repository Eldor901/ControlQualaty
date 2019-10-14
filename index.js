var express = require('express');
var request = require('request');
var needle = require('needle');
var cheerio = require('cheerio');
var tress = require('tress');
var fs = require('fs');
var moment = require('moment');
var resolve = require('url').resolve;


var URL = 'http://52.136.215.164/broken-links/';
var HOMEADRESS = 'http://52.136.215.164';

var brokenLinks = [];
var validLinks = [];
var visited = [];

var now = moment();


function WriteToFile(content, fileName){
    fs.writeFile(fileName, content + '\n', { flag: 'a' }, (err) => {})
};




var q = tress(function(url, callback){
    needle.get(url, function(err, res){
        if (err)
            throw err;

        if(res.statusCode !== 200)
        {
            brokenLinks.push({
                url: url,
                statusCode: res.statusCode,
            })
        }else
        {
            validLinks.push({
                url: url,
                statusCode: res.statusCode,
            })
        }

        var $ = cheerio.load(res.body);

        $('a').each(function ()
        {
            var href = $(this).attr('href');
            if (href != undefined && href != "" && href != "#") {
                var pushingUrl = resolve(URL, href);
                if (pushingUrl.includes(HOMEADRESS))
                {
                    if (!visited.includes(pushingUrl)){
                        visited.push(pushingUrl);
                        q.push(pushingUrl);
                    }
                }
            }
        });

        callback()
        ;
    });
}, 10);

q.drain = function(){
    fs.writeFileSync('./BrokenLinks.txt', JSON.stringify(brokenLinks, null, 4));
    fs.writeFileSync('./ValidLinks.txt', JSON.stringify(validLinks, null, 4));

    WriteToFile( '\n'+brokenLinks.length + " Broken Links" + '\n' + now.format('YYYYY: MM: DD'), './BrokenLinks.txt');
    WriteToFile( '\n'+validLinks.length + " Valid Links " + '\n' + now.format('YYYYY: MM: DD'), './ValidLinks.txt');
};

q.push(URL);


