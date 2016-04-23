// Description:
//   Gets the cheapest place to get fuel
//
//
// Commands:
//   !fuel 'potscode' - tells you if you should fill up and finds the best nearby servo
//

var request = require('request');
var cheerio = require("cheerio");

module.exports = function(robot) {
  robot.respond(/!?fuel ?(\d{4})/i, function(res) {
    var location = res.match[1];
    robot.getFuelPrice(location, res);
  });

  robot.getFuelPrice = function(location, res) {
    request.post(
      'http://www.racq.com.au/AjaxPages/FuelFinderResultsPage.aspx', {
        form: { 'location': location, 'fuel-type': 'Unleaded' }
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(body);
          var response = '';

          //bop it, push it, twist it, scrape it
          var avg_price = $('.price strong').html();
          var good_bad = $('.price span').attr('class').split(' ')[1];
          var commentary = $('.commentary p').html();
          var best_price = $('.fair-fuel-results tbody tr th').html();
          var best_place = $('.fair-fuel-results tbody tr:nth-child(1) td:nth-child(2)').text();
          var best_address = $('.fair-fuel-results tbody tr:nth-child(1) td:nth-child(3)').text();

          if (good_bad == 'is-bad') {
            response += '>:x::fuelpump: Average price in ' + location
                     + ' is bad at: ' + avg_price + ' cents p/L\r\n';
          } else {
            response += '>:white_check_mark::fuelpump: Average price in ' + location
                     + ' is good at ' + avg_price + ' cents p/L\r\n';
          }
          response += '>' + commentary + '\r\n';

          if (!($('.fair-fuel-results').hasClass('regional'))) {
            response += '>For ' + best_price + ' cents, ' + best_place + ' has the best price in your area\r\n';
          } else {
            response += ">Unable to provide specific fuel station price data for your post code\r\n"
          }
        } else {
          res.send('There was an error getting prices. Complain to the ACCC\r\n');
        }
        res.send(response);
      }
    )}
}