$(document).ready(function() {

  $(".todo-item input[type=checkbox]").change(toggleTodo)
  $(".todo-item button").click(deleteTodo)


  $(".todo-form form").submit(function (e) {
    e.preventDefault();
    var text = $(".todo-form input[type=text]").val().trim();
    if (text.length > 0) {
      //append todo
      $(".todo-list").append("<div class='todo-item'><input type='checkbox'>" + text + "<button class='delete'><i class='fas fa-trash-alt'></i></button></div>")
      $.ajax({
			method: "POST",
			url: "/todo",
			data: { todo: text }
		})
		.done(function( msg ) {
			console.log(msg);
		});
    }

    $(".todo-item input[type=checkbox]").change(toggleTodo)

    $(".todo-item button").click(deleteTodo)


    //clear input
    $(".todo-form input[type=text]").val("");
  });

  $("#addModal form").submit(function (e) {
    e.preventDefault();
    var dateTime = $("#addModal form input[name=dateTime]").val().trim();
    var title = $("#addModal form input[name=title]").val().trim();
    if (dateTime.length > 0 && title.length > 0) {
    	//append event if its this week
    	//post event
    }
  })
})

function deleteEvent() {

}


function deleteTodo () {
    $(this).parent().remove();
    $.ajax({
			method: "DELETE",
			url: "/todo",
			data: { id: $(this).parent().attr("todoId") }
		})
		.done(function( msg ) {
			console.log(msg);
		});
}

function toggleTodo () {
	if(this.checked) {
		$(this).parent().addClass("inactive");
		$.ajax({
			method: "PUT",
			url: "/todo",
			data: { id: $(this).parent().attr("todoId"), checked: true }
		})
		.done(function( msg ) {
			console.log(msg);
		});
	} else {
		$(this).parent().removeClass("inactive");
		$.ajax({
			method: "PUT",
			url: "/todo",
			data: { id: $(this).parent().attr("todoId"), checked: false }
		})
		.done(function( msg ) {
			console.log(msg);
		});
	}
}