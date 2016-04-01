$(".moment-date").each(function(){
  var format = $(this).data("format");
  var value = $(this).data("date");
  var mom = moment(value);
  $(this).text(mom.format(format));
});

$(document).ready(function(){

	supportGenie.agentRequests('12');

});