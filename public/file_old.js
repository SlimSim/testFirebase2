const fileHandler = {};
const backendService = {};

$(function () {
"use strict";


/************************************************
/*           Private methods and variables:
/************************************************/

const nameOfCache = "songCache-v1.0";

/************************************************
/*           Public methods:
/************************************************/

backendService.calCurl = async function() {
 const url = environment.getCurlEndpoint();
 $.ajax({
  url: url,
  timeout: 50000,
 }).fail(function( xhr ) {
  console.log( `backendService.calCurl: Could not cal "${url}", no big deal. Status: ${xhr.status}, ${xhr.statusText}` );
 });
};

backendService.getTroffData = async function( troffDataId, fileName ) {

 const url = environment.getTroffDataEndpoint(troffDataId, fileName);

 return $.ajax({
  url: url,
  timeout: 50000,
 })
 .then(async function(response) {
  if( response.status != "OK" ) {
   throw response;
  }
  return response.payload;

 });
};

fileHandler.fetchAndSaveResponse = async function( fileId, songKey ) {
const url = environment.getDownloadFileEndpoint( fileId );
return await fetch( url )
  .then( (response) => {
   if( !response.ok ) {
    throw response;
   }
   return fileHandler.saveResponse( response, songKey );
  });
};


fileHandler.saveResponse = async function( response, url ) {
 return caches.open( nameOfCache ).then( cache => {
  return cache.put(url, response );
 });
};


fileHandler.saveFile = async function( file, callbackFunk ) {
 const url = file.name;

 //TODO: Denna borde kunna använda sig av saveResponse, om jag kör en:
 //TODO: return fileHandler.saveResponse( new Response( file, init ), url ).then( () => {callbackFunk( url ) });
 return caches.open( nameOfCache ).then( cache => {
  let init = { "status" : 200 , "statusText" : "version-3", "responseType" : "cors"};
  return cache.put(url, new Response( file, init ) ).then( () => {
   callbackFunk( url );
  });
 });
};

fileHandler.getObjectUrlFromResponse = async function( response, songKey ) {

 if (response === undefined) {
  throw new ShowUserException(`Can not upload the song "${songKey}" because it appears to not exist in the app.
                Please add the song to Troff and try to upload it again.` );
 }
 return response.blob().then( URL.createObjectURL );
}

fileHandler.getObjectUrlFromFile = async function( songKey ) {
 return caches.match( songKey ).then(cachedResponse => {
  return fileHandler.getObjectUrlFromResponse( cachedResponse, songKey );
 });
};

fileHandler.doesFileExistInCache = async function( url ) {
 let response = await caches.match( url );
 return response !== undefined;

};

fileHandler.removeFile = async function( url ) {
 //TODO: implement removeFile :)
 console.info( "fileHandler.removeFile is not yet implemented :( " );
};

fileHandler.sendFile = async function( fileKey, oSongTroffInfo ) {
 if( await cacheImplementation.isSongV2( fileKey ) ) {
  throw new ShowUserException(`Can not upload the song "${fileKey}" because it is saved in an old format,
     we apologize for the inconvenience.
     Please add the file "${fileKey}" to troff again,
     reload the page and try to upload it again` );
 }

 const strSongTroffInfo = JSON.stringify( oSongTroffInfo );

 return caches.match( fileKey ).then(cachedResponse => {
  if ( cachedResponse === undefined ) {
   throw new ShowUserException(`Can not upload the song "${fileKey}" because it appears to not exist in the app.
          Please add the song to Troff and try to upload it again.` );
  }

  return cachedResponse.blob().then( myBlob => {

   var file = new File(
    [myBlob],
    fileKey,
    {type: myBlob.type}
   );

   let formData = new FormData();
   formData.append( "file", file );
   formData.append( "songTroffInfo", strSongTroffInfo );

   const uploadFileEndpoint =  environment.getUploadFileEndpoint();

   return $.ajax({
    url: uploadFileEndpoint,
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
   });

  });
   });
};

fileHandler.handleFiles = async function( files, callbackFunk ) {
 let i = 0;

 // Loop through the FileList and render the files as appropriate.
 for ( let f; f = files[ i ]; i++) {

  // Only process image, audio and video files.
  if( !(f.type.match('image.*') || f.type.match('audio.*') || f.type.match('video.*')) ) {
   console.error("handleFileSelect2: unrecognized type! f: ", f);
   continue;
  }

  try {
   fileHandler.saveFile( f, callbackFunk );
  } catch( exception ) {
   console.error( "exception", exception)
  }
 }
};

});


