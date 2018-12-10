$(document).ready(function() {

  $(".todo-item input[type=checkbox]").change(toggleTodo);
  $(".todo-item button").click(deleteTodo);
  $(".event .delete").click(deleteEvent);

  $(".todo-form form").submit(function (e) {
    e.preventDefault();
    var text = $(".todo-form input[type=text]").val().trim();
    if (text.length > 0) {
      //append todo
      $.ajax({
			method: "POST",
			url: "/todo",
			data: { todo: text }
		})
		.done(function (result) {
      		$(".todo-list").append("<div class='todo-item' todoid='" + result.message.id + "'><input type='checkbox'>" + text + "<button class='delete'><i class='fas fa-trash-alt'></i></button></div>")

		    $(".todo-item input[type=checkbox]").change(toggleTodo)
		    $(".todo-item button").click(deleteTodo)
		});
    }



    //clear input
    $(".todo-form input[type=text]").val("");
  });
})

// method that sends a post request to delete an event
function deleteEvent() {
	var event = $(this).parent();
	$.ajax({
			method: "DELETE",
			url: "/event",
			data: { id: $(this).parent().attr("id") }
		})
		.done(function() {
			event.remove();
		});
}

// method that sends a post request to delete a todo
function deleteTodo () {
	var todo = $(this).parent()
    $.ajax({
			method: "DELETE",
			url: "/todo",
			data: { id: $(this).parent().attr("todoId") }
		})
		.done(function( msg ) {
			todo.remove();
		});
}

// method that sends a post request to toggle the status of a todo
function toggleTodo () {
	var todo = $(this).parent();
	if(this.checked) {
		$.ajax({
			method: "PUT",
			url: "/todo",
			data: { id: $(this).parent().attr("todoId"), checked: true }
		})
		.done(function( msg ) {
			todo.addClass("inactive");
		});
	} else {
		$.ajax({
			method: "PUT",
			url: "/todo",
			data: { id: $(this).parent().attr("todoId"), checked: false }
		})
		.done(function( msg ) {
			todo.removeClass("inactive");
		});
	}
}