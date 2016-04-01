var supportGenie = {
  apiUrl: "https://supportgenie.io:9074/",
  agentData: {},

  agentRequests: function(userid){
    var params = {'userid': userid};
    $.get(this.apiUrl + "agentRequests", params, function(data){
      console.log(data);
    });
  },
};