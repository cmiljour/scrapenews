 

  //Whenever someone clicks a p tag
  $(document).on("click", "#displayArticles", function() {
    $.getJSON("/articles", function (data){
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            $("#articles").append(
            `<br/>
            <div class="jumbotron" data-id=${data[i]._id}>
            <p> ${data[i].title} 
            <br/>
            <a href='${data[i].link}'>${data[i].link}</a>
            </p>
            <div class="btn btn-danger scrape-new" id="saveCommentBox">Save Comment</div>
            <label for="comment">Comment:</label>
            <textarea id="textInputted" class="form-control" rows="3"></textarea>
            </div>`);
            
        };
    });
  });

  $(document).on("click", "#scrapeArticles", function() {
    $.ajax({
      method: "GET",
      url: "/scrape/"
    });
  });

  // When you click the savenote button
  $(document).on("click", "#saveCommentBox", function() {
      alert("You clicked some shit!");
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from note textarea
        body: $("#textInputted").val()
      }
    })
      // With that done
      .done(function(data) {
        // Log the response
        console.log(data);
        // Empty the articles section
        $("#articles").empty();
      });
  
    // // Also, remove the values entered in the input and textarea for note entry
    // $("#titleinput").val("");
    // $("#bodyinput").val("");
  });