const fetch = require('node-fetch');

const search = async function(query){
let url = "https://www.youtube.com/results?search_query="+query;
  return fetch(url)
    .then(res => res.text())
    .then(body => {
      let val1 = body.search('itemSectionRenderer');
      let val2 = body.search('},{\"continuationItemRenderer');
      body = body.slice(val1, val2);
      body = "{\""+body+"}";
      body = JSON.parse(body);
      let c = 0;
      let i = 0;
      var result = [];
      while(c<3){
        if(body.itemSectionRenderer.contents[i].videoRenderer){
          var res = 
            {
              id: body.itemSectionRenderer.contents[i].videoRenderer.videoId,
             title: body.itemSectionRenderer.contents[i].videoRenderer.title.runs[0].text,
             time: body.itemSectionRenderer.contents[i].videoRenderer.lengthText.simpleText,
              link: "https://www.youtube.com/watch?v="+body.itemSectionRenderer.contents[i].videoRenderer.videoId,
              thumbnail: "https://i.ytimg.com/vi/"+body.itemSectionRenderer.contents[i].videoRenderer.videoId+"/hqdefault.jpg"
            }
          result.push(res);
          i++;
          c++;
        } else {
          i++;
        }
      }   
      return result;
    });
};

exports.search = search;
