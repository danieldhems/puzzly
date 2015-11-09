/*

  SLICE IMAGES

*/

// saved images as an array
var images = fs.readdirSync('captures');

// amount of saved images on disk
var imageCount = images.length;

// assume there are no images currently
var imageCounter = 0;

// create a random string to ID the slices
function randomStringGenerator(length, chars) {

  var result = '';

  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

  return result;

}

// get images function to iterate over the images saved to disk
(function getImage() {

    // use 'setTimeout' to get around memory issues
    setTimeout(function () {

        // if there are more images than have been currently iterated through
        if (imageCount > imageCounter) {

          // path to current image to be sliced
          var image = 'captures/' + images[imageCounter];

          // use the size method to get the image width and height, useful for images submitted on mobile etc.
          gm(image).size(function(err, value){

            // check for errors, TO DO: put this in 'if' statement
            console.log('Error: ', err);

            // get current image width
            var imageWidth = value.width;

            // get current image height
            var imageHeight = value.height;

            // start slicing on first pixel
            var sliceCounter = 1;

            //
            (function getSlices() {

              // use 'setTimeout' to get around memory issues
              setTimeout(function() {

                // if the image height is bigger than the current slice
                if (imageHeight > sliceCounter) {

                  // apply the random string to the slice name, time not needed here as it is in the parent image file name
                  var randomString = randomStringGenerator(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

                  // crop image to the full width of current image and increments of 1 pixel
                  gm(image).crop(imageWidth, 1, sliceCounter, 0).write('slices/slice' + randomString + '.png', function (err) {

                    // check for errors, TO DO: put this in 'if' statement
                    console.log('Error: ', err);

                    // increase the slice counter, to affect the next slice
                    sliceCounter++;

                    // fire function recurssively, to help with memory
                    getSlices();
                  });

                } else {

                  // if we have sliced the whole image, increase the 'imageCounter' to iterate over next image
                  imageCounter++;

                  // get next image
                  getImage();

                }

              }, 250);

            })();

          });

        }

    }, 250);

})();