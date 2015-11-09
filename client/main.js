var form = document.forms[0];
form.addEventListener('submit', function(e){
	e.preventDefault();

	create( new FormData(form) );
});

function create(payload){

	// Create request
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/api/upload', true);
	xhr.send(payload);

}

/**
*
*	Fn to be used when iterating over img to take slices
*	and draw them on canvas
*
*	@param sliceW Desired width of slide
* 	@param sliceH Desired height of slice
*	@praam progress How many slices have been placed so far
*	so we know where to place the next slice
*
*/


window.onload = function(){
	Puzzly.init('canvas', 'img');
}