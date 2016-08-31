const kinveyBaseUrl = "https://baas.kinvey.com/";
const kinveyAppId = "kid_H1zbzqrK";
const kinveyAppSecret = "d50295cd8c864b51bcfd95928a0082f3";


/* <--- NAVIGATION MENU TOGGLE ---> */
function showHideNavigationLinks() {
	let loggedIn = localStorage.getItem('authToken') != null;
	if (loggedIn)
	{
		$("#linkLogin").hide();
		$("#linkProfile").show();
		$("#linkPictures").show();
		$("#linkVideos").show();
		$("#linkRegister").hide();
		$("#linkListBooks").show();
		$("#linkCreateBook").show();
		$("#linkLogout").show();
	} else {
		$("#linkLogin").show();
		$("#linkProfile").hide();
		$("#linkPictures").hide();
		$("#linkVideos").hide();
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
function showVideosView() {
	showView('VideosView')
}
function showPicturesView() {
	showView('PicturesView')
}
function showProfileView() {
	showView('viewProfile');
	getProfile();
}
function login(username, password, callback) {
	let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
	let loginUrl = kinveyBaseUrl + "user/" + kinveyAppId + "/login";
	let loginData = {
		username: username,
		password: password,
	};
	$.ajax({
		method: "POST",
		url: loginUrl,
		data: loginData,
		headers: { "Authorization": "Basic " + authBase64},
		success: callback,
		error: showAjaxError
	});
}
function loginSuccess(data, status) {
	showInfo("Login Successful");
	localStorage.setItem('authToken', data._kmd.authtoken);
	localStorage.setItem('id', data._id);
	localStorage.setItem('username', data.username);		
	showHomeView();
	showListBooksView();
	showHideNavigationLinks();
	$('#userLogin').val('');
	$('#passLogin').val('');
}
function getProfile() {
	let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
	let profileUrl = kinveyBaseUrl + "user/" + kinveyAppId + "/" + localStorage.getItem('id');
	$.ajax({
		method: "GET",
		url: profileUrl,
		headers: { "Authorization": "Kinvey " + localStorage.getItem('authToken')},
		success: profileSuccess,
		error: showAjaxError
	});
	function profileSuccess(data, status) {
		$('#nameProfile').val(data.name);
		$('#emailProfile').val(data.email);
	}
}
function updateProfile() {
	login(localStorage.getItem('username'), $('#passProfile').val(), updateProfileCallback)
}
function updateProfileCallback(data, status) {
	let profileUrl = kinveyBaseUrl + "user/" + kinveyAppId + "/" + localStorage.getItem('id');
	let profileData = {
		password: $('#newpassProfile').val(),
		name: $('#nameProfile').val(),
		email: $('#emailProfile').val(),
	};
	$.ajax({
		method: "PUT",
		url: profileUrl,
		contentType: 'application/json',
		data: JSON.stringify(profileData),
		headers: { "Authorization": "Kinvey " + localStorage.getItem('authToken') },
		success: profileSuccess,
		error: showAjaxError
	});
	function profileSuccess(data, status) {
		showInfo("Updated profile");			
		localStorage.setItem('authToken', data._kmd.authtoken);
		localStorage.setItem('id', data._id);
		localStorage.setItem('username', data.username);		
	}
}
function showRegisterView() {
	showView('viewRegister')
}
function register() {
	let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
	let registerUrl = kinveyBaseUrl + "user/" + kinveyAppId + "/";
	let registerData = {
		name: $("#nameRegister").val(),
		email: $("#emailRegister").val(),		
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
		localStorage.setItem('authToken', data._kmd.authtoken);
		localStorage.setItem('id', data._id);
		localStorage.setItem('username', data.username);		
		showHideNavigationLinks();
		showHomeView();
	}
	$('#userRegister').val('');
	$('#passRegister').val('');
}
function showListBooksView() {
	showView('viewListBooks')
	$('#bookTitle').empty();
	let authHeaders = { "Authorization": "Kinvey " + localStorage.getItem('authToken')};
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
	let authHeaders = { "Authorization": "Kinvey " + localStorage.getItem('authToken'),
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
		'Authorization': 'Kinvey ' + localStorage.getItem('authToken'),
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
	$.ajax({
		method: "POST",
		url: kinveyBaseUrl + 'user/' + kinveyAppId + '/_logout',
		headers: { "Authorization": "Kinvey " + localStorage.getItem('authToken')},
		success: loggedOut,
		error: showAjaxError
	});
	function loggedOut() {
		localStorage.removeItem('authToken');
		localStorage.removeItem('id');
		localStorage.removeItem('username');	
		showHomeView();
		showHideNavigationLinks();
	}
}

$(function () {
	/* Navigation */
	$("#linkHome").click(showHomeView);
	$("#linkProfile").click(showProfileView);
	$("#linkPictures").click(showPicturesView);
	$("#linkVideos").click(showVideosView);
	$("#linkLogin").click(showLoginView);
	$("#linkRegister").click(showRegisterView);

	$("#linkListBooks").click(showListBooksView);
	$("#linkCreateBook").click(showCreateBookView);
	$("#linkLogout").click(logout);

	/* Submit Buttons */
	$('#formLogin').submit(function(e)
	{
		e.preventDefault();
		login($("#userLogin").val(), $("#passLogin").val(), loginSuccess);
	});
	$('#formRegister').submit(function(e)
	{e.preventDefault(); register()});
	$('#profileForm').submit(function(e)
	{e.preventDefault(); updateProfile()});
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