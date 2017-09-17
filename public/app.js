 

  //Whenever someone clicks a p tag
  $(document).on("click", "#displayArticles", function() {
    $.getJSON("/articles", function (data){
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            $("#articles").append(`<p> ${data[i].title} <br /><a href='${data[i].link}'>Link</a></p>`);
          }
    });
  });

          //     // The title of the article
        //     $("#articles").append("<h2>" + data.title + "</h2>");
        //     // The link to the article
        //     $("#articles").append(`<p><a href='${data.link}'>Google</a></p>`);
        //     // A textarea to add a new note body
        //     $("#articles").append(`<p>${data.comment}`);
        // }

  $(document).on("click", "#scrapeArticles", function() {
    
    $.ajax({
      method: "GET",
      url: "/scrape/"
    })
      // With that done, add the note information to the page
      .done(function(data) {
        console.log(data);
      });
  });



  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .done(function(data) {
        // Log the response
        console.log(data);
        // Empty the articles section
        $("#articles").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });