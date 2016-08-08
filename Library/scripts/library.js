/**
 * Created by tangrila on 26-Jun-16.
 */

const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppId = "kid_By0qzDpH";
const kinveyAppSecret = "44e18f3c45564defb69f28dd6eb853bd";


/* <--- NAVIGATION MENU TOGGLE ---> */
function showHideNavigationLinks() {
	let loggedIn = sessionStorage.authToken != null;
	if (loggedIn)
	{
		$("#linkLogin").hide();
		$("#linkRegister").hide();
		$("#linkListBooks").show();
		$("#linkCreateBook").show();
		$("#linkLogout").show();
	} else {
		$("#linkLogin").show();
		$("#linkRegister").show();
		$("#linkListBooks").hide();
		$("#linkCreateBook").hide();
		$("#linkLogout").hide();
	}
}
/* /--- NAVIGATION MENU TOGGLE ---\ */

/* <--- NOTIFICATIONS ---> */
function showAjaxError(data, status) {
	let errorMsg;
	if (data.responseJSON && data.responseJSON.description)
		errorMsg = data.responseJSON.description;
	else if (typeof(data.readyState) != 'undefined' && data.readyState == '0')
		errorMsg = "Network error";
	else
		errorMsg = "Error " + JSON.stringify(data);
	$('#errorBox').text(errorMsg).fadeIn();
}

function showInfo(messageText) {
	$("#infoBox").text(messageText);
	$('#infoBox').fadeIn(2000);
	setTimeout(function () { $('#infoBox').fadeOut(2000) }, 3000)
}
/* /--- NOTIFICATIONS ---\ */
function showView(viewId) {
	$("main > section").hide();
	$("#" + viewId).show();
}

function showHomeView() {
	showView('viewHome')
}

function showLoginView() {
	showView('viewLogin')
}

function login() {
	let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
	let loginUrl = kinveyBaseUrl + "user/" + kinveyAppId + "/login";
	let loginData = {
		username: $("#userLogin").val(),
		password: $("#passLogin").val(),
	};
	$.ajax({
		method: "POST",
		url: loginUrl,
		data: loginData,
		headers: { "Authorization": "Basic " + authBase64},
		success: loginSuccess,
		error: showAjaxError
	});
	function loginSuccess(data, status) {
		showInfo("Login Successful");
		sessionStorage.authToken = data._kmd.authtoken;
		showListBooksView();
		showHideNavigationLinks();
	}
	$('#userLogin').val('');
	$('#passLogin').val('');
}

function showRegisterView() {
	showView('viewRegister')
}

function register() {
	let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
	let registerUrl = kinveyBaseUrl + "user/" + kinveyAppId + "/";
	let registerData = {
		username: $("#userRegister").val(),
		password: $("#passRegister").val(),
	};
	$.ajax({
		method: "POST",
		url: registerUrl,
		data: registerData,
		headers: { "Authorization": "Basic " + authBase64},
		success: registerSuccess,
		error: showAjaxError
	});
	function registerSuccess(data, status) {
		showInfo("Registration Successful!");
		sessionStorage.authToken = data._kmd.authtoken;
		showHideNavigationLinks();
	}
	$('#userRegister').val('');
	$('#passRegister').val('');
}

function showListBooksView() {
	showView('viewListBooks')
	$('#bookTitle').empty();
	let authHeaders = { "Authorization": "Kinvey " + sessionStorage.authToken};
	let booksUrl = kinveyBaseUrl + "appdata/" + kinveyAppId + "/books";
	$.ajax({
		method: "GET",
		url: booksUrl,
		headers: authHeaders,
		success: booksLoaded,
		error: showAjaxError
	});

	function booksLoaded(books, status) {
		$('#books').empty();
		showInfo("Books loaded");
		let booksTable = $('<table>').
			append($('<tr>').
				append($('<th>Title</th>')).
				append($('<th>Author</th>')).
				append($('<th>Description</th>'))
			);

		for (let book of books) {
			booksTable.append().
			append($('<tr>').
				append($('<td></td>').text(book.title)).
				append($('<td></td>').text(book.author)).
				append($('<td></td>').text(book.description))
			).
				// Adds the comments div to each book
			append($('<div class="comment">').append('Add comment'));
		}

		$('#books').append(booksTable);
	}
}

function showCreateBookView() {
	showView('viewCreateBook')
}

function createBook() {
	let authHeaders = { "Authorization": "Kinvey " + sessionStorage.authToken,
		"Content-Type": "application/json"}
	let booksUrl = kinveyBaseUrl + "appdata/" + kinveyAppId + "/books";
	let newBookData = {
		title: $('#bookTitle').val(),
		author: $('#bookAuthor').val(),
		description: $('#bookDescription').val()
	}
	$.ajax({
		method: "POST",
		url: booksUrl,
		data: JSON.stringify(newBookData),
		headers: authHeaders,
		success: bookCreated,
		error: showAjaxError
	});
	$('#bookTitle').val('');
	$('#bookAuthor').val('');
	$('#bookDescription').val('');

	function bookCreated(data) {
		showInfo('Book Created')
	}
}

function addBookComment(bookData, commentText, commentAuthor) {
	const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppId + "/books";
	const kinveyHeaders = {
		'Authorization': 'Kinvey ' + sessionStorage.authToken,
		'Content-type': 'application/json'
	};

	if (!bookData.comments) {
		bookData.comments = [];
	}
	bookData.comments.push({text: commentText, author: commentAuthor});

	$.ajax({
		method: "PUT",
		url: kinveyBooksUrl + '/' + bookData._id,
		headers: kinveyHeaders,
		data: JSON.stringify(bookData),
		success: addBookCommentSuccess,
		error: showAjaxError
	});
	
	function addBookCommenSuccess(response) {
		showListBooksView();
		showInfo('Book comment added.');
	}
}

function logout() {
	alert('Logout');
	sessionStorage.clear();
	showHomeView();
	showHideNavigationLinks();
}

$(function () {
	/* Navigation */
	$("#linkHome").click(showHomeView);
	$("#linkLogin").click(showLoginView);
	$("#linkRegister").click(showRegisterView);
	$("#linkListBooks").click(showListBooksView);
	$("#linkCreateBook").click(showCreateBookView);
	$("#linkLogout").click(logout);

	/* Submit Buttons */
	$('#formLogin').submit(function(e)
	{e.preventDefault(); login()});
	$('#formRegister').submit(function(e)
	{e.preventDefault(); register()});
	$('#formCreateBook').submit(function(e)
	{e.preventDefault(); createBook()});

	showHomeView();
	showHideNavigationLinks();
	/* Loading notification during ajax requests */
	$(document)
		.ajaxStart(function () {
			$('#loadingBox').show();
		})
		.ajaxStop(function () {
			$('#loadingBox').fadeOut();
		})
})