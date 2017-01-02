import Puzzly from './puzzly';

/*
var form = document.forms[0];
form.addEventListener('submit', function(e){
	e.preventDefault();
	upload(form);
});
*/

function onUploadSuccess(response){
	// Puzzly.init('canvas', response.image.path, response.numPieces);
}

function onUploadFailure(response){
	console.log(response);
}

function upload(form){

	var fd = new FormData(form);

	fetch('/api/new', {
		body: fd,
		method: 'POST'
	}).then( function(r){
		return r.json();
	}).then( function(d){
		onUploadSuccess(d);
	}).catch( function(err){
		onUploadFailure(err);
	});
}

new Puzzly('canvas', './halflife-3-2.jpg', 1);
