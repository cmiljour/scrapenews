 

  //Whenever someone clicks a p tag
  $(document).on("click", "#displayArticles", function() {
    $("#articles").empty();
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
            <textarea id="${data[i]._id}" class="form-control" rows="3" placeholder="Enter Comment Here"></textarea>
            <div data-id=${data[i]._id} class="btn btn-danger scrape-new" id="saveCommentBox">Save Comment</div>
            </div>`);
            
        };
    });
  });

  $(document).on("click", "#scrapeArticles", function() {
    $.ajax({
      method: "GET",
      url: "/scrape/"
    });
    alert("Click on \"Display Articles\" to read!");
  });

  $(document).on("click", "#savedArticles", function() {
    
    $.ajax({
      method: "GET",
      url: "/saved/"
    }).done(function(data){
      $("#articles").empty();
      for (var i = 0; i < data.length; i++) {
          // if document has a null comment field value, it stops displaying comments
          // continue on to next record if null found
          if (data[i].comment == null){
            console.log("it is null");
            continue;
          } else {
            // Display the apropos information on the page
            $("#articles").append(
              `<br/>
              <div class="jumbotron">
              <p> ${data[i].title} 
              <br/>
              <a href='${data[i].link}'>${data[i].link}</a>
              </p>
              <div class="panel panel-default">
                <div class="panel-body">You Commented:  ${data[i].comment.body}</div>
              </div>
              <br/>
              <div data-id=${data[i]._id} class="btn btn-danger scrape-new" id="delComment">Delete Comment</div>
              </div>`);   
          }
      };
    });
  });

  // When you click the savenote button
  $(document).on("click", "#saveCommentBox", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    var commentTxt = $("#" + thisId).val();
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from note textarea
        body: commentTxt,
        id: thisId
      }
    })
      // With that done
      .done(function(data) {
        // Log the response
        // Empty the articles section
        // $("#articles").empty();
      });
    
    alert("Article Comment Saved!");
    // // Also, remove the values entered in the input and textarea for note entry
    // $("#titleinput").val("");
    // $("#bodyinput").val("");
  });

  $(document).on("click", "#delComment", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/delete/" + thisId,
      data: {
        id: thisId
      }
    });
    $(this).parent().remove();
  });